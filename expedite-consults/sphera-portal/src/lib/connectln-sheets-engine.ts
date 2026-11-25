export type CellFormat = 'general' | 'currency' | 'percent' | 'number' | 'integer'
export type CellAlign = 'left' | 'center' | 'right'

export interface SheetCellStyle {
  bold?: boolean
  italic?: boolean
  format?: CellFormat
  align?: CellAlign
  bg?: string
  color?: string
}

export interface SheetCell {
  raw: string
  style?: SheetCellStyle
}

export interface EvaluatedValue {
  value: string | number | boolean
  error?: string
  numeric?: number
}

const MAX_RANGE_CELLS = 5000

export function colIndexToLabel(index: number): string {
  if (!Number.isFinite(index) || index < 0) return 'A'
  let n = Math.floor(index)
  let label = ''
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label
    n = Math.floor(n / 26) - 1
  }
  return label
}

export function colLabelToIndex(label: string): number {
  const clean = label.trim().toUpperCase()
  if (!/^[A-Z]+$/.test(clean)) return -1
  let result = 0
  for (let i = 0; i < clean.length; i++) {
    result = result * 26 + (clean.charCodeAt(i) - 64)
  }
  return result - 1
}

export function makeCellKey(col: number, row: number): string {
  const safeCol = Math.max(0, Math.floor(col))
  const safeRow = Math.max(0, Math.floor(row))
  return `${colIndexToLabel(safeCol)}${safeRow + 1}`
}

export function normalizeCellKey(ref: string): string | null {
  const parsed = parseCellKey(ref)
  if (!parsed) return null
  return makeCellKey(parsed.col, parsed.row)
}

export function parseCellKey(ref: string): { col: number; row: number } | null {
  const match = /^\$?([A-Za-z]{1,3})\$?(\d{1,5})$/.exec(ref.trim())
  if (!match) return null
  const col = colLabelToIndex(match[1])
  const rowNum = Number.parseInt(match[2], 10)
  if (col < 0 || !Number.isFinite(rowNum) || rowNum < 1) return null
  return { col, row: rowNum - 1 }
}

export function expandCellRange(startRef: string, endRef: string): string[] {
  const start = parseCellKey(startRef)
  const end = parseCellKey(endRef)
  if (!start || !end) return []
  const minCol = Math.min(start.col, end.col)
  const maxCol = Math.max(start.col, end.col)
  const minRow = Math.min(start.row, end.row)
  const maxRow = Math.max(start.row, end.row)
  const keys: string[] = []
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      keys.push(makeCellKey(c, r))
      if (keys.length >= MAX_RANGE_CELLS) return keys
    }
  }
  return keys
}

type TokenType =
  | 'number'
  | 'string'
  | 'boolean'
  | 'ident'
  | 'cell'
  | 'op'
  | 'paren'
  | 'comma'
  | 'colon'
  | 'eof'

interface Token {
  type: TokenType
  value: string
}

class FormulaEvalError extends Error {
  code: string
  constructor(code: string, message?: string) {
    super(message || code)
    this.code = code
  }
}

function tokenizeFormula(expr: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const n = expr.length

  while (i < n) {
    const ch = expr[i]
    if (/\s/.test(ch)) {
      i++
      continue
    }

    // String literal
    if (ch === '"') {
      let str = ''
      i++
      while (i < n) {
        if (expr[i] === '"') {
          if (i + 1 < n && expr[i + 1] === '"') {
            str += '"'
            i += 2
            continue
          }
          i++
          break
        }
        str += expr[i]
        i++
      }
      tokens.push({ type: 'string', value: str })
      continue
    }

    // Multi-char operators
    const two = expr.slice(i, i + 2)
    if (two === '<=' || two === '>=' || two === '<>' || two === '!=') {
      tokens.push({ type: 'op', value: two })
      i += 2
      continue
    }

    // Single-char operators & delimiters
    if ('+-*/^=<>'.includes(ch)) {
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch })
      i++
      continue
    }
    if (ch === ',') {
      tokens.push({ type: 'comma', value: ch })
      i++
      continue
    }
    if (ch === ':') {
      tokens.push({ type: 'colon', value: ch })
      i++
      continue
    }

    // Numbers
    if (/\d/.test(ch) || (ch === '.' && i + 1 < n && /\d/.test(expr[i + 1]))) {
      let numStr = ''
      let hasDot = false
      while (i < n && (/\d/.test(expr[i]) || (!hasDot && expr[i] === '.'))) {
        if (expr[i] === '.') hasDot = true
        numStr += expr[i]
        i++
      }
      if (i < n && expr[i] === '%') {
        i++
        const num = Number.parseFloat(numStr) / 100
        tokens.push({ type: 'number', value: String(num) })
      } else {
        tokens.push({ type: 'number', value: numStr })
      }
      continue
    }

    // Cell references ($A$1) or identifiers / function names / booleans
    if (/[A-Za-z_$]/.test(ch)) {
      let ident = ''
      while (i < n && /[A-Za-z0-9_$]/.test(expr[i])) {
        ident += expr[i]
        i++
      }
      const upper = ident.toUpperCase()
      if (upper === 'TRUE' || upper === 'FALSE') {
        // Only treat as boolean if not followed immediately by '(' or ':'
        if (expr[i] !== '(' && expr[i] !== ':') {
          tokens.push({ type: 'boolean', value: upper })
          continue
        }
      }
      if (/^\$?[A-Za-z]{1,3}\$?\d{1,5}$/.test(ident) && expr[i] !== '(') {
        const norm = normalizeCellKey(ident)
        if (norm) {
          tokens.push({ type: 'cell', value: norm })
          continue
        }
      }
      tokens.push({ type: 'ident', value: upper })
      continue
    }

    throw new FormulaEvalError('#ERROR!', `Unexpected character "${ch}"`)
  }

  tokens.push({ type: 'eof', value: '' })
  return tokens
}

function parseLiteralRaw(raw: string): EvaluatedValue {
  const trimmed = raw.trim()
  if (trimmed === '') return { value: '' }
  const upper = trimmed.toUpperCase()
  if (upper === 'TRUE') return { value: true }
  if (upper === 'FALSE') return { value: false }

  // Allow common plain numbers (optional leading $, commas, trailing %) cleanly
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const n = Number(trimmed)
    if (Number.isFinite(n)) return { value: n, numeric: n }
  }
  if (/^-?\$[\d,]+(\.\d+)?$/.test(trimmed)) {
    const n = Number(trimmed.replace(/[$,]/g, ''))
    if (Number.isFinite(n)) return { value: n, numeric: n }
  }
  if (/^-?\d+(\.\d+)?%$/.test(trimmed)) {
    const n = Number(trimmed.slice(0, -1)) / 100
    if (Number.isFinite(n)) return { value: n, numeric: n }
  }

  return { value: raw }
}

function toNumber(val: EvaluatedValue): number {
  if (val.error) throw new FormulaEvalError(val.error)
  if (typeof val.numeric === 'number' && Number.isFinite(val.numeric)) return val.numeric
  if (typeof val.value === 'number' && Number.isFinite(val.value)) return val.value
  if (typeof val.value === 'boolean') return val.value ? 1 : 0
  const s = String(val.value).trim()
  if (s === '') return 0
  const cleaned = s.replace(/^\$/, '').replace(/,/g, '')
  if (/^-?\d+(\.\d+)?$/.test(cleaned)) {
    const n = Number(cleaned)
    if (Number.isFinite(n)) return n
  }
  throw new FormulaEvalError('#VALUE!')
}

function toBoolean(val: EvaluatedValue): boolean {
  if (val.error) throw new FormulaEvalError(val.error)
  if (typeof val.value === 'boolean') return val.value
  if (typeof val.numeric === 'number') return val.numeric !== 0
  if (typeof val.value === 'number') return val.value !== 0
  const s = String(val.value).trim().toUpperCase()
  if (s === 'TRUE') return true
  if (s === 'FALSE' || s === '') return false
  return true
}

function compareValues(a: EvaluatedValue, b: EvaluatedValue): number {
  if (a.error) throw new FormulaEvalError(a.error)
  if (b.error) throw new FormulaEvalError(b.error)
  const aNum = typeof a.value === 'number' ? a.value : typeof a.numeric === 'number' ? a.numeric : null
  const bNum = typeof b.value === 'number' ? b.value : typeof b.numeric === 'number' ? b.numeric : null
  if (aNum !== null && bNum !== null) {
    return aNum < bNum ? -1 : aNum > bNum ? 1 : 0
  }
  if (typeof a.value === 'boolean' && typeof b.value === 'boolean') {
    return a.value === b.value ? 0 : a.value ? 1 : -1
  }
  const aStr = String(a.value)
  const bStr = String(b.value)
  return aStr.localeCompare(bStr)
}

type ArgEntry =
  | { kind: 'scalar'; val: EvaluatedValue }
  | { kind: 'range'; keys: string[] }

function collectNumericValues(
  args: ArgEntry[],
  cells: Record<string, SheetCell>,
  visiting: Set<string>,
  cache: Map<string, EvaluatedValue>
): number[] {
  const nums: number[] = []
  for (const arg of args) {
    if (arg.kind === 'scalar') {
      if (arg.val.error) throw new FormulaEvalError(arg.val.error)
      if (typeof arg.val.numeric === 'number') {
        nums.push(arg.val.numeric)
      } else if (typeof arg.val.value === 'number') {
        nums.push(arg.val.value)
      } else if (typeof arg.val.value === 'boolean') {
        nums.push(arg.val.value ? 1 : 0)
      } else if (String(arg.val.value).trim() !== '') {
        const parsed = Number(String(arg.val.value).replace(/^\$/, '').replace(/,/g, ''))
        if (Number.isFinite(parsed)) nums.push(parsed)
      }
    } else {
      for (const key of arg.keys) {
        const ev = evaluateCellInternal(key, cells, visiting, cache)
        if (ev.error) throw new FormulaEvalError(ev.error)
        if (typeof ev.numeric === 'number') {
          nums.push(ev.numeric)
        } else if (typeof ev.value === 'number') {
          nums.push(ev.value)
        }
      }
    }
  }
  return nums
}

function collectAllValues(
  args: ArgEntry[],
  cells: Record<string, SheetCell>,
  visiting: Set<string>,
  cache: Map<string, EvaluatedValue>
): EvaluatedValue[] {
  const vals: EvaluatedValue[] = []
  for (const arg of args) {
    if (arg.kind === 'scalar') {
      if (arg.val.error) throw new FormulaEvalError(arg.val.error)
      vals.push(arg.val)
    } else {
      for (const key of arg.keys) {
        const ev = evaluateCellInternal(key, cells, visiting, cache)
        if (ev.error) throw new FormulaEvalError(ev.error)
        vals.push(ev)
      }
    }
  }
  return vals
}

function invokeFunction(
  name: string,
  args: ArgEntry[],
  cells: Record<string, SheetCell>,
  visiting: Set<string>,
  cache: Map<string, EvaluatedValue>
): EvaluatedValue {
  switch (name) {
    case 'SUM': {
      const nums = collectNumericValues(args, cells, visiting, cache)
      const total = nums.reduce((acc, v) => acc + v, 0)
      return { value: total, numeric: total }
    }
    case 'AVERAGE':
    case 'AVG': {
      const nums = collectNumericValues(args, cells, visiting, cache)
      if (nums.length === 0) throw new FormulaEvalError('#DIV/0!')
      const avg = nums.reduce((acc, v) => acc + v, 0) / nums.length
      return { value: avg, numeric: avg }
    }
    case 'MIN': {
      const nums = collectNumericValues(args, cells, visiting, cache)
      if (nums.length === 0) return { value: 0, numeric: 0 }
      const min = Math.min(...nums)
      return { value: min, numeric: min }
    }
    case 'MAX': {
      const nums = collectNumericValues(args, cells, visiting, cache)
      if (nums.length === 0) return { value: 0, numeric: 0 }
      const max = Math.max(...nums)
      return { value: max, numeric: max }
    }
    case 'COUNT': {
      const nums = collectNumericValues(args, cells, visiting, cache)
      return { value: nums.length, numeric: nums.length }
    }
    case 'COUNTA': {
      const vals = collectAllValues(args, cells, visiting, cache)
      const nonEmpty = vals.filter((v) => String(v.value).trim() !== '').length
      return { value: nonEmpty, numeric: nonEmpty }
    }
    case 'MEDIAN': {
      const nums = collectNumericValues(args, cells, visiting, cache).sort((a, b) => a - b)
      if (nums.length === 0) throw new FormulaEvalError('#VALUE!')
      const mid = Math.floor(nums.length / 2)
      const med = nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid]
      return { value: med, numeric: med }
    }
    case 'PRODUCT': {
      const nums = collectNumericValues(args, cells, visiting, cache)
      if (nums.length === 0) return { value: 0, numeric: 0 }
      const prod = nums.reduce((acc, v) => acc * v, 1)
      return { value: prod, numeric: prod }
    }
    case 'ROUND': {
      if (args.length < 1 || args[0].kind !== 'scalar') throw new FormulaEvalError('#VALUE!')
      const n = toNumber(args[0].val)
      const digits = args[1] && args[1].kind === 'scalar' ? Math.trunc(toNumber(args[1].val)) : 0
      const factor = Math.pow(10, Math.min(10, Math.max(-10, digits)))
      const rounded = Math.round(n * factor) / factor
      return { value: rounded, numeric: rounded }
    }
    case 'ABS': {
      if (args.length !== 1 || args[0].kind !== 'scalar') throw new FormulaEvalError('#VALUE!')
      const n = Math.abs(toNumber(args[0].val))
      return { value: n, numeric: n }
    }
    case 'SQRT': {
      if (args.length !== 1 || args[0].kind !== 'scalar') throw new FormulaEvalError('#VALUE!')
      const n = toNumber(args[0].val)
      if (n < 0) throw new FormulaEvalError('#VALUE!')
      const res = Math.sqrt(n)
      return { value: res, numeric: res }
    }
    case 'POWER': {
      if (args.length !== 2 || args[0].kind !== 'scalar' || args[1].kind !== 'scalar') {
        throw new FormulaEvalError('#VALUE!')
      }
      const res = Math.pow(toNumber(args[0].val), toNumber(args[1].val))
      if (!Number.isFinite(res)) throw new FormulaEvalError('#VALUE!')
      return { value: res, numeric: res }
    }
    case 'INT': {
      if (args.length !== 1 || args[0].kind !== 'scalar') throw new FormulaEvalError('#VALUE!')
      const res = Math.floor(toNumber(args[0].val))
      return { value: res, numeric: res }
    }
    case 'MOD': {
      if (args.length !== 2 || args[0].kind !== 'scalar' || args[1].kind !== 'scalar') {
        throw new FormulaEvalError('#VALUE!')
      }
      const divisor = toNumber(args[1].val)
      if (divisor === 0) throw new FormulaEvalError('#DIV/0!')
      const res = toNumber(args[0].val) % divisor
      return { value: res, numeric: res }
    }
    case 'CONCAT': {
      const vals = collectAllValues(args, cells, visiting, cache)
      return { value: vals.map((v) => String(v.value ?? '')).join('') }
    }
    case 'LEN': {
      if (args.length !== 1 || args[0].kind !== 'scalar') throw new FormulaEvalError('#VALUE!')
      const len = String(args[0].val.value ?? '').length
      return { value: len, numeric: len }
    }
    case 'UPPER': {
      if (args.length !== 1 || args[0].kind !== 'scalar') throw new FormulaEvalError('#VALUE!')
      return { value: String(args[0].val.value ?? '').toUpperCase() }
    }
    case 'LOWER': {
      if (args.length !== 1 || args[0].kind !== 'scalar') throw new FormulaEvalError('#VALUE!')
      return { value: String(args[0].val.value ?? '').toLowerCase() }
    }
    default:
      throw new FormulaEvalError('#NAME?', `Unknown function ${name}`)
  }
}

class FormulaParser {
  private tokens: Token[]
  private pos = 0
  private cells: Record<string, SheetCell>
  private visiting: Set<string>
  private cache: Map<string, EvaluatedValue>

  constructor(
    tokens: Token[],
    cells: Record<string, SheetCell>,
    visiting: Set<string>,
    cache: Map<string, EvaluatedValue>
  ) {
    this.tokens = tokens
    this.cells = cells
    this.visiting = visiting
    this.cache = cache
  }

  private peek(offset = 0): Token {
    return this.tokens[this.pos + offset] || { type: 'eof', value: '' }
  }

  private consume(): Token {
    const t = this.peek()
    this.pos++
    return t
  }

  parseRoot(): EvaluatedValue {
    const val = this.parseComparison()
    if (this.peek().type !== 'eof') {
      throw new FormulaEvalError('#ERROR!')
    }
    return val
  }

  private parseComparison(): EvaluatedValue {
    let left = this.parseAdditive()
    while (
      this.peek().type === 'op' &&
      ['=', '<>', '!=', '<', '>', '<=', '>='].includes(this.peek().value)
    ) {
      const op = this.consume().value
      const right = this.parseAdditive()
      const cmp = compareValues(left, right)
      let res = false
      if (op === '=') res = cmp === 0
      else if (op === '<>' || op === '!=') res = cmp !== 0
      else if (op === '<') res = cmp < 0
      else if (op === '>') res = cmp > 0
      else if (op === '<=') res = cmp <= 0
      else if (op === '>=') res = cmp >= 0
      left = { value: res }
    }
    return left
  }

  private parseAdditive(): EvaluatedValue {
    let left = this.parseMultiplicative()
    while (this.peek().type === 'op' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value
      const right = this.parseMultiplicative()
      const l = toNumber(left)
      const r = toNumber(right)
      const num = op === '+' ? l + r : l - r
      left = { value: num, numeric: num }
    }
    return left
  }

  private parseMultiplicative(): EvaluatedValue {
    let left = this.parsePower()
    while (this.peek().type === 'op' && (this.peek().value === '*' || this.peek().value === '/')) {
      const op = this.consume().value
      const right = this.parsePower()
      const l = toNumber(left)
      const r = toNumber(right)
      if (op === '/') {
        if (r === 0) throw new FormulaEvalError('#DIV/0!')
        const num = l / r
        left = { value: num, numeric: num }
      } else {
        const num = l * r
        left = { value: num, numeric: num }
      }
    }
    return left
  }

  private parsePower(): EvaluatedValue {
    const base = this.parseUnary()
    if (this.peek().type === 'op' && this.peek().value === '^') {
      this.consume()
      const exp = this.parsePower()
      const res = Math.pow(toNumber(base), toNumber(exp))
      if (!Number.isFinite(res)) throw new FormulaEvalError('#VALUE!')
      return { value: res, numeric: res }
    }
    return base
  }

  private parseUnary(): EvaluatedValue {
    if (this.peek().type === 'op' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value
      const val = this.parseUnary()
      const num = toNumber(val)
      const signed = op === '-' ? -num : num
      return { value: signed, numeric: signed }
    }
    return this.parsePrimary()
  }

  private parsePrimary(): EvaluatedValue {
    const tok = this.peek()

    if (tok.type === 'number') {
      this.consume()
      const n = Number(tok.value)
      return { value: n, numeric: n }
    }

    if (tok.type === 'string') {
      this.consume()
      return { value: tok.value }
    }

    if (tok.type === 'boolean') {
      this.consume()
      return { value: tok.value === 'TRUE' }
    }

    if (tok.type === 'cell') {
      this.consume()
      const ref = evaluateCellInternal(tok.value, this.cells, this.visiting, this.cache)
      if (ref.error) throw new FormulaEvalError(ref.error)
      return ref
    }

    if (tok.type === 'paren' && tok.value === '(') {
      this.consume()
      const inner = this.parseComparison()
      if (this.peek().type !== 'paren' || this.peek().value !== ')') {
        throw new FormulaEvalError('#ERROR!')
      }
      this.consume()
      return inner
    }

    if (tok.type === 'ident') {
      const fnName = this.consume().value
      if (this.peek().type === 'paren' && this.peek().value === '(') {
        this.consume()
        // Lazily evaluate IF so untaken branches with e.g. #DIV/0! don't fault unnecessarily
        if (fnName === 'IF') {
          return this.parseIfCall()
        }
        const args: ArgEntry[] = []
        if (!(this.peek().type === 'paren' && this.peek().value === ')')) {
          while (true) {
            if (this.peek().type === 'cell' && this.peek(1).type === 'colon' && this.peek(2).type === 'cell') {
              const startCell = this.consume().value
              this.consume() // :
              const endCell = this.consume().value
              args.push({ kind: 'range', keys: expandCellRange(startCell, endCell) })
            } else {
              args.push({ kind: 'scalar', val: this.parseComparison() })
            }
            if (this.peek().type === 'comma') {
              this.consume()
              continue
            }
            break
          }
        }
        if (this.peek().type !== 'paren' || this.peek().value !== ')') {
          throw new FormulaEvalError('#ERROR!')
        }
        this.consume()
        return invokeFunction(fnName, args, this.cells, this.visiting, this.cache)
      }
      throw new FormulaEvalError('#NAME?', `Unknown identifier ${fnName}`)
    }

    throw new FormulaEvalError('#ERROR!')
  }

  private skipBalancedArg(): void {
    let depth = 0
    while (this.peek().type !== 'eof') {
      const t = this.peek()
      if (t.type === 'paren' && t.value === '(') {
        depth++
        this.consume()
        continue
      }
      if (t.type === 'paren' && t.value === ')') {
        if (depth === 0) return
        depth--
        this.consume()
        continue
      }
      if (t.type === 'comma' && depth === 0) {
        return
      }
      this.consume()
    }
  }

  private parseIfCall(): EvaluatedValue {
    const condVal = this.parseComparison()
    const truthy = toBoolean(condVal)
    if (this.peek().type !== 'comma') {
      throw new FormulaEvalError('#VALUE!')
    }
    this.consume()

    let result: EvaluatedValue
    if (truthy) {
      result = this.parseComparison()
      if (this.peek().type === 'comma') {
        this.consume()
        this.skipBalancedArg()
      }
    } else {
      this.skipBalancedArg()
      if (this.peek().type === 'comma') {
        this.consume()
        result = this.parseComparison()
      } else {
        result = { value: false }
      }
    }

    if (this.peek().type !== 'paren' || this.peek().value !== ')') {
      throw new FormulaEvalError('#ERROR!')
    }
    this.consume()
    return result
  }
}

function evaluateCellInternal(
  cellKey: string,
  cells: Record<string, SheetCell>,
  visiting: Set<string>,
  cache: Map<string, EvaluatedValue>
): EvaluatedValue {
  const normKey = normalizeCellKey(cellKey) || cellKey.toUpperCase()
  const cached = cache.get(normKey)
  if (cached) return cached

  if (visiting.has(normKey)) {
    return { value: '#CYCLE!', error: '#CYCLE!' }
  }

  const cell = cells[normKey]
  if (!cell || cell.raw === '') {
    const empty: EvaluatedValue = { value: '' }
    cache.set(normKey, empty)
    return empty
  }

  const raw = cell.raw
  if (!raw.trimStart().startsWith('=')) {
    const lit = parseLiteralRaw(raw)
    cache.set(normKey, lit)
    return lit
  }

  const expr = raw.trimStart().slice(1).trim()
  if (!expr) {
    const errVal: EvaluatedValue = { value: '#ERROR!', error: '#ERROR!' }
    cache.set(normKey, errVal)
    return errVal
  }

  visiting.add(normKey)
  try {
    const tokens = tokenizeFormula(expr)
    const parser = new FormulaParser(tokens, cells, visiting, cache)
    const evaluated = parser.parseRoot()
    cache.set(normKey, evaluated)
    return evaluated
  } catch (err) {
    const code = err instanceof FormulaEvalError ? err.code : '#ERROR!'
    const errVal: EvaluatedValue = { value: code, error: code }
    cache.set(normKey, errVal)
    return errVal
  } finally {
    visiting.delete(normKey)
  }
}

export function evaluateCell(
  cellKey: string,
  cells: Record<string, SheetCell>,
  visiting: Set<string> = new Set()
): EvaluatedValue {
  return evaluateCellInternal(cellKey, cells, visiting, new Map())
}

export function evaluateSheet(cells: Record<string, SheetCell>): Record<string, EvaluatedValue> {
  const results: Record<string, EvaluatedValue> = {}
  const cache = new Map<string, EvaluatedValue>()
  for (const key of Object.keys(cells)) {
    results[key] = evaluateCellInternal(key, cells, new Set(), cache)
  }
  return results
}

export function formatEvaluatedValue(ev: EvaluatedValue | undefined, format: CellFormat = 'general'): string {
  if (!ev) return ''
  if (ev.error) return ev.error
  if (ev.value === '') return ''
  if (typeof ev.value === 'boolean') return ev.value ? 'TRUE' : 'FALSE'

  const num = typeof ev.numeric === 'number' ? ev.numeric : typeof ev.value === 'number' ? ev.value : null
  if (num === null || !Number.isFinite(num)) {
    return String(ev.value)
  }

  switch (format) {
    case 'currency': {
      const sign = num < 0 ? '-' : ''
      const absStr = Math.abs(num).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      return `${sign}$${absStr}`
    }
    case 'percent': {
      const pct = (num * 100).toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
      return `${pct}%`
    }
    case 'number':
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    case 'integer':
      return Math.round(num).toLocaleString('en-US', {
        maximumFractionDigits: 0,
      })
    case 'general':
    default: {
      const rounded = Math.round(num * 1e9) / 1e9
      return String(rounded)
    }
  }
}

export function parseCsvToGrid(csvText: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let field = ''
  let inQuotes = false
  const text = csvText.replace(/^\uFEFF/, '')

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      currentRow.push(field)
      field = ''
    } else if (ch === '\r') {
      if (i + 1 < text.length && text[i + 1] === '\n') i++
      currentRow.push(field)
      rows.push(currentRow)
      currentRow = []
      field = ''
    } else if (ch === '\n') {
      currentRow.push(field)
      rows.push(currentRow)
      currentRow = []
      field = ''
    } else {
      field += ch
    }
  }

  if (field !== '' || currentRow.length > 0) {
    currentRow.push(field)
    rows.push(currentRow)
  }

  return rows
}

export function gridToCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? '')
          if (/[",\r\n]/.test(s)) {
            return `"${s.replace(/"/g, '""')}"`
          }
          return s
        })
        .join(',')
    )
    .join('\r\n')
}
