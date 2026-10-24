import ts from "typescript";

const ATTRS = new Set(["aria-label", "aria-description", "title", "placeholder", "alt", "label"]);

function phrase(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length < 2 || clean.length > 700) return "";
  if (!/[A-Za-z]/.test(clean)) return "";
  if (/^https?:\/\//.test(clean)) return "";
  if (/^[./#@{]/.test(clean)) return "";
  if (/^[\d\s.,:+\-/%]+$/.test(clean)) return "";
  if (clean.includes("{") || clean.includes("}")) return "";
  if (!/\s/.test(clean) && /\d/.test(clean)) return "";
  if (/\.(tsx?|jsx?|png|jpe?g|svg|mp4|css|json)$/i.test(clean)) return "";
  return clean;
}

function hasVtImport(code) {
  return /\bimport\s*\{[^}]*\bvt\b[^}]*\}\s*from\s*["']@\/lib\/locale["']/.test(code);
}

function isVtCall(node) {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "vt";
}

function collectRendered(node, bag) {
  if (!node) return;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    if (node.parent && isVtCall(node.parent)) return;
    if (phrase(node.text)) bag.push(node);
    return;
  }
  if (ts.isConditionalExpression(node)) {
    collectRendered(node.whenTrue, bag);
    collectRendered(node.whenFalse, bag);
    return;
  }
  if (ts.isBinaryExpression(node)) {
    const kind = node.operatorToken.kind;
    if (
      kind === ts.SyntaxKind.AmpersandAmpersandToken ||
      kind === ts.SyntaxKind.BarBarToken ||
      kind === ts.SyntaxKind.QuestionQuestionToken
    ) {
      collectRendered(node.left, bag);
      collectRendered(node.right, bag);
    }
  } else if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) {
    collectRendered(node.expression, bag);
  }
}

export function transformLocale(code, filename = "file.tsx") {
  if (code.includes("/* vt-skip */")) return code;
  const sf = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  if (sf.parseDiagnostics?.length) return code;
  const edits = [];
  function visit(node) {
    if (ts.isJsxText(node)) {
      const clean = phrase(node.text);
      if (clean) edits.push({ start: node.getStart(sf), end: node.getEnd(), text: `{vt(${JSON.stringify(clean)})}` });
    } else if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer) && ATTRS.has(node.name.text)) {
      const clean = phrase(node.initializer.text);
      if (clean) {
        edits.push({
          start: node.initializer.getStart(sf),
          end: node.initializer.getEnd(),
          text: `{vt(${JSON.stringify(clean)})}`,
        });
      }
    } else if (ts.isJsxExpression(node) && node.expression) {
      const parent = node.parent;
      const isChild = ts.isJsxElement(parent) || ts.isJsxFragment(parent);
      const isAttr = ts.isJsxAttribute(parent) && ATTRS.has(parent.name.text);
      if (isChild || isAttr) {
        const bag = [];
        collectRendered(node.expression, bag);
        for (const literal of bag) {
          const clean = phrase(literal.text);
          if (!clean) continue;
          edits.push({
            start: literal.getStart(sf),
            end: literal.getEnd(),
            text: `vt(${JSON.stringify(clean)})`,
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  if (!edits.length) return code;
  edits.sort((a, b) => b.start - a.start);
  const seen = new Set();
  let next = code;
  for (const edit of edits) {
    const key = `${edit.start}:${edit.end}`;
    if (seen.has(key)) continue;
    seen.add(key);
    next = next.slice(0, edit.start) + edit.text + next.slice(edit.end);
  }
  if (hasVtImport(next)) return next;
  let insertAt = 0;
  for (const statement of sf.statements) {
    if (ts.isImportDeclaration(statement)) insertAt = statement.end;
  }
  if (!insertAt) {
    const directive = next.match(/^\s*(?:["']use client["'];?\s*)/);
    insertAt = directive ? directive[0].length : 0;
  }
  return `${next.slice(0, insertAt)}\nimport { vt } from "@/lib/locale";\n${next.slice(insertAt)}`;
}
