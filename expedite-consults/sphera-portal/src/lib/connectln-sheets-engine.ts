export type CellFormat =
  | 'general'
  | 'currency'
  | 'accounting'
  | 'percent'
  | 'number'
  | 'integer'
  | 'date'
  | 'scientific'
export type CellAlign = 'left' | 'center' | 'right'

export interface SheetCellStyle {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  wrapText?: boolean
  fontSize?: number
  decimals?: number
  border?: 'none' | 'all' | 'bottom' | 'topBottom' | 'box'
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
  | {
      kind: 'range'
      startCol: number
      startRow: number
      endCol: number
      endRow: number
      keys: string[]
    }

function makeRangeArg(startRef: string, endRef: string): ArgEntry {
  const s = parseCellKey(startRef)
  const e = parseCellKey(endRef)
  if (!s || !e) {
    return { kind: 'range', startCol: 0, startRow: 0, endCol: 0, endRow: 0, keys: [] }
  }
  return {
    kind: 'range',
    startCol: Math.min(s.col, e.col),
    startRow: Math.min(s.row, e.row),
    endCol: Math.max(s.col, e.col),
    endRow: Math.max(s.row, e.row),
    keys: expandCellRange(startRef, endRef),
  }
}

function parseFlexDate(rawVal: EvaluatedValue): Date {
  if (rawVal.error) throw new FormulaEvalError(rawVal.error)
  if (typeof rawVal.numeric === 'number' && Number.isFinite(rawVal.numeric)) {
    return new Date(rawVal.numeric > 100000000000 ? rawVal.numeric : rawVal.numeric * 86400000)
  }
  const s = String(rawVal.value ?? '').trim()
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s)
  if (isoMatch) {
    return new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3])
    )
  }
  const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(s)
  if (usMatch) {
    const yr = Number(usMatch[3].length === 2 ? `20${usMatch[3]}` : usMatch[3])
    return new Date(yr, Number(usMatch[1]) - 1, Number(usMatch[2]))
  }
  const parsed = new Date(s)
  if (Number.isNaN(parsed.getTime())) throw new FormulaEvalError('#VALUE!')
  return parsed
}

function toCriteriaMatcher(criteriaVal: EvaluatedValue): (ev: EvaluatedValue) => boolean {
  if (criteriaVal.error) throw new FormulaEvalError(criteriaVal.error)
  const rawStr = String(criteriaVal.value ?? '').trim()
  const opMatch = /^(>=|<=|<>|!=|>|<|=)(.*)$/.exec(rawStr)
  if (opMatch) {
    const op = opMatch[1]
    const rhsRaw = opMatch[2].trim()
    const rhsNum = Number(rhsRaw.replace(/^\$/, '').replace(/,/g, ''))
    const rhsIsNum = rhsRaw !== '' && Number.isFinite(rhsNum)
    return (ev: EvaluatedValue) => {
      const lhsNum =
        typeof ev.numeric === 'number'
          ? ev.numeric
          : typeof ev.value === 'number'
          ? ev.value
          : null
      if (rhsIsNum && lhsNum !== null) {
        if (op === '>=') return lhsNum >= rhsNum
        if (op === '<=') return lhsNum <= rhsNum
        if (op === '<>' || op === '!=') return lhsNum !== rhsNum
        if (op === '>') return lhsNum > rhsNum
        if (op === '<') return lhsNum < rhsNum
        return lhsNum === rhsNum
      }
      const lStr = String(ev.value ?? '').trim().toLowerCase()
      const rStr = rhsRaw.toLowerCase()
      if (op === '<>' || op === '!=') return lStr !== rStr
      if (op === '=') return lStr === rStr
      return false
    }
  }

  const targetNum =
    typeof criteriaVal.numeric === 'number'
      ? criteriaVal.numeric
      : typeof criteriaVal.value === 'number'
      ? criteriaVal.value
      : null
  return (ev: EvaluatedValue) => {
    if (targetNum !== null && typeof ev.numeric === 'number') {
      return ev.numeric === targetNum
    }
    return (
      String(ev.value ?? '').trim().toLowerCase() === rawStr.toLowerCase()
    )
  }
}

function getScalarArg(arg: ArgEntry | undefined): EvaluatedValue {
  if (!arg || arg.kind !== 'scalar') throw new FormulaEvalError('#VALUE!')
  return arg.val
}

function extractFlatValues(
  arg: ArgEntry,
  cells: Record<string, SheetCell>,
  visiting: Set<string>,
  cache: Map<string, EvaluatedValue>
): EvaluatedValue[] {
  if (arg.kind === 'scalar') {
    if (arg.val.error) throw new FormulaEvalError(arg.val.error)
    return [arg.val]
  }
  return arg.keys.map((k) => {
    const ev = evaluateCellInternal(k, cells, visiting, cache)
    if (ev.error) throw new FormulaEvalError(ev.error)
    return ev
  })
}

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
    case 'PROPER': {
      const s = String(getScalarArg(args[0]).value ?? '')
      return {
        value: s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
      }
    }
    case 'TRIM': {
      const s = String(getScalarArg(args[0]).value ?? '')
      return { value: s.trim().replace(/\s+/g, ' ') }
    }
    case 'LEFT': {
      const s = String(getScalarArg(args[0]).value ?? '')
      const count = args[1] ? Math.max(0, Math.trunc(toNumber(getScalarArg(args[1])))) : 1
      return { value: s.slice(0, count) }
    }
    case 'RIGHT': {
      const s = String(getScalarArg(args[0]).value ?? '')
      const count = args[1] ? Math.max(0, Math.trunc(toNumber(getScalarArg(args[1])))) : 1
      return { value: count === 0 ? '' : s.slice(-count) }
    }
    case 'MID': {
      const s = String(getScalarArg(args[0]).value ?? '')
      const start1 = Math.max(1, Math.trunc(toNumber(getScalarArg(args[1]))))
      const len = Math.max(0, Math.trunc(toNumber(getScalarArg(args[2]))))
      return { value: s.slice(start1 - 1, start1 - 1 + len) }
    }
    case 'SUBSTITUTE': {
      const s = String(getScalarArg(args[0]).value ?? '')
      const oldText = String(getScalarArg(args[1]).value ?? '')
      const newText = String(getScalarArg(args[2]).value ?? '')
      if (!oldText) return { value: s }
      return { value: s.split(oldText).join(newText) }
    }
    case 'FIND': {
      const needle = String(getScalarArg(args[0]).value ?? '')
      const haystack = String(getScalarArg(args[1]).value ?? '')
      const start1 = args[2] ? Math.max(1, Math.trunc(toNumber(getScalarArg(args[2])))) : 1
      const idx = haystack.indexOf(needle, start1 - 1)
      if (idx === -1) throw new FormulaEvalError('#VALUE!')
      return { value: idx + 1, numeric: idx + 1 }
    }
    case 'CONCATENATE': {
      const vals = collectAllValues(args, cells, visiting, cache)
      return { value: vals.map((v) => String(v.value ?? '')).join('') }
    }
    case 'TEXTJOIN': {
      const delim = String(getScalarArg(args[0]).value ?? '')
      const ignoreEmpty = toBoolean(getScalarArg(args[1]))
      const vals = collectAllValues(args.slice(2), cells, visiting, cache)
        .map((v) => String(v.value ?? ''))
        .filter((s) => (!ignoreEmpty ? true : s.trim() !== ''))
      return { value: vals.join(delim) }
    }
    case 'AND': {
      const vals = collectAllValues(args, cells, visiting, cache)
      if (vals.length === 0) throw new FormulaEvalError('#VALUE!')
      return { value: vals.every((v) => toBoolean(v)) }
    }
    case 'OR': {
      const vals = collectAllValues(args, cells, visiting, cache)
      if (vals.length === 0) throw new FormulaEvalError('#VALUE!')
      return { value: vals.some((v) => toBoolean(v)) }
    }
    case 'NOT': {
      return { value: !toBoolean(getScalarArg(args[0])) }
    }
    case 'IFS': {
      for (let i = 0; i + 1 < args.length; i += 2) {
        if (toBoolean(getScalarArg(args[i]))) {
          return getScalarArg(args[i + 1])
        }
      }
      throw new FormulaEvalError('#N/A')
    }
    case 'ROUNDUP': {
      const n = toNumber(getScalarArg(args[0]))
      const digits = args[1] ? Math.trunc(toNumber(getScalarArg(args[1]))) : 0
      const f = Math.pow(10, Math.min(10, Math.max(-10, digits)))
      const res = n >= 0 ? Math.ceil(n * f) / f : Math.floor(n * f) / f
      return { value: res, numeric: res }
    }
    case 'ROUNDDOWN': {
      const n = toNumber(getScalarArg(args[0]))
      const digits = args[1] ? Math.trunc(toNumber(getScalarArg(args[1]))) : 0
      const f = Math.pow(10, Math.min(10, Math.max(-10, digits)))
      const res = Math.trunc(n * f) / f
      return { value: res, numeric: res }
    }
    case 'CEILING': {
      const n = toNumber(getScalarArg(args[0]))
      const sig = args[1] ? toNumber(getScalarArg(args[1])) : 1
      if (sig === 0) return { value: 0, numeric: 0 }
      const res = Math.ceil(n / sig) * sig
      return { value: res, numeric: res }
    }
    case 'FLOOR': {
      const n = toNumber(getScalarArg(args[0]))
      const sig = args[1] ? toNumber(getScalarArg(args[1])) : 1
      if (sig === 0) throw new FormulaEvalError('#DIV/0!')
      const res = Math.floor(n / sig) * sig
      return { value: res, numeric: res }
    }
    case 'SIGN': {
      const res = Math.sign(toNumber(getScalarArg(args[0])))
      return { value: res, numeric: res }
    }
    case 'PI': {
      return { value: Math.PI, numeric: Math.PI }
    }
    case 'RAND': {
      const r = Math.random()
      return { value: r, numeric: r }
    }
    case 'COUNTBLANK': {
      const vals = collectAllValues(args, cells, visiting, cache)
      const blanks = vals.filter((v) => String(v.value ?? '').trim() === '').length
      return { value: blanks, numeric: blanks }
    }
    case 'STDEV': {
      const nums = collectNumericValues(args, cells, visiting, cache)
      if (nums.length < 2) throw new FormulaEvalError('#DIV/0!')
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length
      const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (nums.length - 1)
      const sd = Math.sqrt(variance)
      return { value: sd, numeric: sd }
    }
    case 'VAR': {
      const nums = collectNumericValues(args, cells, visiting, cache)
      if (nums.length < 2) throw new FormulaEvalError('#DIV/0!')
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length
      const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (nums.length - 1)
      return { value: variance, numeric: variance }
    }
    case 'LARGE': {
      if (args.length !== 2) throw new FormulaEvalError('#VALUE!')
      const nums = collectNumericValues([args[0]], cells, visiting, cache).sort((a, b) => b - a)
      const k = Math.trunc(toNumber(getScalarArg(args[1])))
      if (k < 1 || k > nums.length) throw new FormulaEvalError('#NUM!')
      return { value: nums[k - 1], numeric: nums[k - 1] }
    }
    case 'SMALL': {
      if (args.length !== 2) throw new FormulaEvalError('#VALUE!')
      const nums = collectNumericValues([args[0]], cells, visiting, cache).sort((a, b) => a - b)
      const k = Math.trunc(toNumber(getScalarArg(args[1])))
      if (k < 1 || k > nums.length) throw new FormulaEvalError('#NUM!')
      return { value: nums[k - 1], numeric: nums[k - 1] }
    }
    case 'SUMIF':
    case 'AVERAGEIF':
    case 'COUNTIF': {
      if (args.length < 2) throw new FormulaEvalError('#VALUE!')
      const condVals = extractFlatValues(args[0], cells, visiting, cache)
      const matcher = toCriteriaMatcher(getScalarArg(args[1]))
      if (name === 'COUNTIF') {
        const hits = condVals.filter(matcher).length
        return { value: hits, numeric: hits }
      }
      const targetVals =
        args[2] ? extractFlatValues(args[2], cells, visiting, cache) : condVals
      let total = 0
      let matchedNums = 0
      condVals.forEach((ev, idx) => {
        if (matcher(ev)) {
          const val = targetVals[idx]
          if (val && typeof val.numeric === 'number') {
            total += val.numeric
            matchedNums++
          }
        }
      })
      if (name === 'AVERAGEIF') {
        if (matchedNums === 0) throw new FormulaEvalError('#DIV/0!')
        const avg = total / matchedNums
        return { value: avg, numeric: avg }
      }
      return { value: total, numeric: total }
    }
    case 'VLOOKUP': {
      if (args.length < 3 || args[1].kind !== 'range') throw new FormulaEvalError('#VALUE!')
      const lookupVal = getScalarArg(args[0])
      const tbl = args[1]
      const colIdx = Math.trunc(toNumber(getScalarArg(args[2])))
      const approx = args[3] ? toBoolean(getScalarArg(args[3])) : true
      const width = tbl.endCol - tbl.startCol + 1
      if (colIdx < 1 || colIdx > width) throw new FormulaEvalError('#REF!')

      let bestRow: number | null = null
      for (let r = tbl.startRow; r <= tbl.endRow; r++) {
        const key = makeCellKey(tbl.startCol, r)
        const cellVal = evaluateCellInternal(key, cells, visiting, cache)
        if (cellVal.error) continue
        const cmp = compareValues(cellVal, lookupVal)
        if (cmp === 0) {
          bestRow = r
          break
        }
        if (approx && cmp <= 0) {
          bestRow = r
        }
      }
      if (bestRow === null) throw new FormulaEvalError('#N/A')
      const outKey = makeCellKey(tbl.startCol + colIdx - 1, bestRow)
      return evaluateCellInternal(outKey, cells, visiting, cache)
    }
    case 'HLOOKUP': {
      if (args.length < 3 || args[1].kind !== 'range') throw new FormulaEvalError('#VALUE!')
      const lookupVal = getScalarArg(args[0])
      const tbl = args[1]
      const rowIdx = Math.trunc(toNumber(getScalarArg(args[2])))
      const approx = args[3] ? toBoolean(getScalarArg(args[3])) : true
      const height = tbl.endRow - tbl.startRow + 1
      if (rowIdx < 1 || rowIdx > height) throw new FormulaEvalError('#REF!')

      let bestCol: number | null = null
      for (let c = tbl.startCol; c <= tbl.endCol; c++) {
        const key = makeCellKey(c, tbl.startRow)
        const cellVal = evaluateCellInternal(key, cells, visiting, cache)
        if (cellVal.error) continue
        const cmp = compareValues(cellVal, lookupVal)
        if (cmp === 0) {
          bestCol = c
          break
        }
        if (approx && cmp <= 0) {
          bestCol = c
        }
      }
      if (bestCol === null) throw new FormulaEvalError('#N/A')
      const outKey = makeCellKey(bestCol, tbl.startRow + rowIdx - 1)
      return evaluateCellInternal(outKey, cells, visiting, cache)
    }
    case 'INDEX': {
      if (args.length < 2 || args[0].kind !== 'range') throw new FormulaEvalError('#VALUE!')
      const rng = args[0]
      const rowNum = Math.trunc(toNumber(getScalarArg(args[1])))
      const colNum = args[2] ? Math.trunc(toNumber(getScalarArg(args[2]))) : 1
      const targetRow = rng.startRow + rowNum - 1
      const targetCol = rng.startCol + colNum - 1
      if (
        targetRow < rng.startRow ||
        targetRow > rng.endRow ||
        targetCol < rng.startCol ||
        targetCol > rng.endCol
      ) {
        throw new FormulaEvalError('#REF!')
      }
      return evaluateCellInternal(makeCellKey(targetCol, targetRow), cells, visiting, cache)
    }
    case 'MATCH': {
      if (args.length < 2) throw new FormulaEvalError('#VALUE!')
      const lookupVal = getScalarArg(args[0])
      const vals = extractFlatValues(args[1], cells, visiting, cache)
      const matchType = args[2] ? Math.trunc(toNumber(getScalarArg(args[2]))) : 1
      if (matchType === 0) {
        const idx = vals.findIndex((v) => compareValues(v, lookupVal) === 0)
        if (idx === -1) throw new FormulaEvalError('#N/A')
        return { value: idx + 1, numeric: idx + 1 }
      }
      let bestIdx = -1
      vals.forEach((v, idx) => {
        const cmp = compareValues(v, lookupVal)
        if (matchType > 0 && cmp <= 0) bestIdx = idx
        if (matchType < 0 && cmp >= 0 && bestIdx === -1) bestIdx = idx
      })
      if (bestIdx === -1) throw new FormulaEvalError('#N/A')
      return { value: bestIdx + 1, numeric: bestIdx + 1 }
    }
    case 'PMT': {
      const rate = toNumber(getScalarArg(args[0]))
      const nper = toNumber(getScalarArg(args[1]))
      const pv = toNumber(getScalarArg(args[2]))
      if (nper === 0) throw new FormulaEvalError('#NUM!')
      const pmt =
        rate === 0 ? -(pv / nper) : -(pv * rate) / (1 - Math.pow(1 + rate, -nper))
      return { value: pmt, numeric: pmt }
    }
    case 'FV': {
      const rate = toNumber(getScalarArg(args[0]))
      const nper = toNumber(getScalarArg(args[1]))
      const pmt = toNumber(getScalarArg(args[2]))
      const pv = args[3] ? toNumber(getScalarArg(args[3])) : 0
      const fv =
        rate === 0
          ? -(pv + pmt * nper)
          : -(pv * Math.pow(1 + rate, nper) + (pmt * (Math.pow(1 + rate, nper) - 1)) / rate)
      return { value: fv, numeric: fv }
    }
    case 'PV': {
      const rate = toNumber(getScalarArg(args[0]))
      const nper = toNumber(getScalarArg(args[1]))
      const pmt = toNumber(getScalarArg(args[2]))
      const pv =
        rate === 0 ? -(pmt * nper) : -(pmt * (1 - Math.pow(1 + rate, -nper))) / rate
      return { value: pv, numeric: pv }
    }
    case 'NPV': {
      const rate = toNumber(getScalarArg(args[0]))
      const cashflows = collectNumericValues(args.slice(1), cells, visiting, cache)
      const npv = cashflows.reduce(
        (acc, cf, idx) => acc + cf / Math.pow(1 + rate, idx + 1),
        0
      )
      return { value: npv, numeric: npv }
    }
    case 'TODAY': {
      return { value: new Date().toISOString().slice(0, 10) }
    }
    case 'NOW': {
      return { value: new Date().toISOString().slice(0, 16).replace('T', ' ') }
    }
    case 'YEAR': {
      const yr = parseFlexDate(getScalarArg(args[0])).getFullYear()
      return { value: yr, numeric: yr }
    }
    case 'MONTH': {
      const mo = parseFlexDate(getScalarArg(args[0])).getMonth() + 1
      return { value: mo, numeric: mo }
    }
    case 'DAY': {
      const d = parseFlexDate(getScalarArg(args[0])).getDate()
      return { value: d, numeric: d }
    }
    case 'DATEDIF': {
      const start = parseFlexDate(getScalarArg(args[0]))
      const end = parseFlexDate(getScalarArg(args[1]))
      const unit = String(getScalarArg(args[2]).value ?? 'D').toUpperCase()
      const diffMs = end.getTime() - start.getTime()
      if (unit === 'D') {
        const days = Math.round(diffMs / 86400000)
        return { value: days, numeric: days }
      }
      if (unit === 'M') {
        const months =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth())
        return { value: months, numeric: months }
      }
      if (unit === 'Y') {
        const years = end.getFullYear() - start.getFullYear()
        return { value: years, numeric: years }
      }
      throw new FormulaEvalError('#VALUE!')
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
        if (fnName === 'IFERROR') {
          return this.parseIfErrorCall()
        }
        const args: ArgEntry[] = []
        if (!(this.peek().type === 'paren' && this.peek().value === ')')) {
          while (true) {
            if (this.peek().type === 'cell' && this.peek(1).type === 'colon' && this.peek(2).type === 'cell') {
              const startCell = this.consume().value
              this.consume() // :
              const endCell = this.consume().value
              args.push(makeRangeArg(startCell, endCell))
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

  private parseIfErrorCall(): EvaluatedValue {
    const startPos = this.pos
    let primary: EvaluatedValue | null = null
    let failed = false
    try {
      primary = this.parseComparison()
      if (primary.error) failed = true
    } catch {
      failed = true
      this.pos = startPos
      this.skipBalancedArg()
    }

    if (this.peek().type !== 'comma') {
      throw new FormulaEvalError('#VALUE!')
    }
    this.consume()

    let fallback: EvaluatedValue = primary || { value: '' }
    if (failed) {
      fallback = this.parseComparison()
    } else {
      this.skipBalancedArg()
    }

    if (this.peek().type !== 'paren' || this.peek().value !== ')') {
      throw new FormulaEvalError('#ERROR!')
    }
    this.consume()
    return fallback
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

export function formatEvaluatedValue(
  ev: EvaluatedValue | undefined,
  format: CellFormat = 'general',
  decimals?: number
): string {
  if (!ev) return ''
  if (ev.error) return ev.error
  if (ev.value === '') return ''
  if (typeof ev.value === 'boolean') return ev.value ? 'TRUE' : 'FALSE'

  if (format === 'date') {
    try {
      const d = parseFlexDate(ev)
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return String(ev.value)
    }
  }

  const num = typeof ev.numeric === 'number' ? ev.numeric : typeof ev.value === 'number' ? ev.value : null
  if (num === null || !Number.isFinite(num)) {
    return String(ev.value)
  }

  const d =
    typeof decimals === 'number' ? Math.max(0, Math.min(4, Math.trunc(decimals))) : undefined

  switch (format) {
    case 'currency': {
      const digits = d ?? 2
      const sign = num < 0 ? '-' : ''
      const absStr = Math.abs(num).toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
      return `${sign}$${absStr}`
    }
    case 'accounting': {
      const digits = d ?? 2
      const absStr = Math.abs(num).toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
      return num < 0 ? `$(${absStr})` : `$ ${absStr}`
    }
    case 'percent': {
      const digits = d ?? 1
      const pct = (num * 100).toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
      return `${pct}%`
    }
    case 'number': {
      const digits = d ?? 2
      return num.toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    }
    case 'integer':
      return Math.round(num).toLocaleString('en-US', {
        maximumFractionDigits: 0,
      })
    case 'scientific':
      return num.toExponential(d ?? 2).toUpperCase()
    case 'general':
    default: {
      if (d !== undefined) {
        return num.toLocaleString('en-US', {
          minimumFractionDigits: d,
          maximumFractionDigits: d,
        })
      }
      const rounded = Math.round(num * 1e9) / 1e9
      return String(rounded)
    }
  }
}

export function shiftFormulaRefs(formula: string, colDelta: number, rowDelta: number): string {
  if (!formula.trimStart().startsWith('=')) return formula
  return formula.replace(
    /(\$?)([A-Za-z]{1,3})(\$?)(\d{1,5})(?!\()/g,
    (full, colLock: string, colStr: string, rowLock: string, rowStr: string) => {
      const parsedCol = colLabelToIndex(colStr)
      const parsedRow = Number.parseInt(rowStr, 10)
      if (parsedCol < 0 || !Number.isFinite(parsedRow) || parsedRow < 1) return full
      const nextCol = colLock === '$' ? parsedCol : Math.max(0, parsedCol + colDelta)
      const nextRow = rowLock === '$' ? parsedRow : Math.max(1, parsedRow + rowDelta)
      return `${colLock}${colIndexToLabel(nextCol)}${rowLock}${nextRow}`
    }
  )
}

export function matchesConditionalRule(
  ev: EvaluatedValue | undefined,
  op: 'gt' | 'lt' | 'eq' | 'contains',
  target: string
): boolean {
  if (!ev || ev.error || ev.value === '') return false
  if (op === 'contains') {
    return String(ev.value).toLowerCase().includes(target.trim().toLowerCase())
  }
  const evNum =
    typeof ev.numeric === 'number'
      ? ev.numeric
      : typeof ev.value === 'number'
      ? ev.value
      : null
  const targetNum = Number(target.replace(/^\$/, '').replace(/,/g, ''))
  if (evNum !== null && target.trim() !== '' && Number.isFinite(targetNum)) {
    if (op === 'gt') return evNum > targetNum
    if (op === 'lt') return evNum < targetNum
    return evNum === targetNum
  }
  if (op === 'eq') {
    return String(ev.value).trim().toLowerCase() === target.trim().toLowerCase()
  }
  return false
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
