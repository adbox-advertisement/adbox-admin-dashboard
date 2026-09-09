import path from 'node:path'
import ts from 'typescript'

const root = process.cwd()
const config = ts.readConfigFile('tsconfig.app.json', ts.sys.readFile)
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'))
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
const files = parsed.fileNames.filter(file => !file.endsWith('.d.ts'))
const sourceFiles = new Set(files)
const graph = new Map(files.map(file => [file, new Set()]))
const violations = []
const relative = file => path.relative(root, file).split(path.sep).join('/')
const feature = file => relative(file).match(/^src\/features\/([^/]+)\//)?.[1]

for (const file of files) {
  const source = ts.createSourceFile(file, ts.sys.readFile(file), ts.ScriptTarget.Latest, true)
  function inspect(node) {
    let specifier
    let typeOnly = false
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      specifier = node.moduleSpecifier
      const bindings = ts.isImportDeclaration(node) ? node.importClause?.namedBindings : node.exportClause
      typeOnly = Boolean(node.isTypeOnly || node.importClause?.isTypeOnly)
      if (bindings && (ts.isNamedImports(bindings) || ts.isNamedExports(bindings))) {
        typeOnly ||= !node.importClause?.name && bindings.elements.length > 0 && bindings.elements.every(item => item.isTypeOnly)
      }
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      specifier = node.arguments[0]
    }
    if (specifier && ts.isStringLiteral(specifier)) {
      const resolved = ts.resolveModuleName(specifier.text, file, parsed.options, ts.sys).resolvedModule?.resolvedFileName
      if (resolved && sourceFiles.has(resolved)) {
        const from = relative(file)
        const to = relative(resolved)
        const fromFeature = feature(file)
        const toFeature = feature(resolved)
        const report = message => violations.push(`${from} → ${to}: ${message}`)
        if (/^src\/(api|components|config|hooks|lib|types|utils)\//.test(from) && /^src\/(features|app|layouts)\//.test(to)) {
          report('Shared modules must not depend on features or application composition')
        }
        if (toFeature && fromFeature !== toFeature && !to.endsWith('/index.ts')) {
          report('Consume a feature through its public index.ts')
        }
        if (fromFeature && (/^src\/(app|layouts)\//.test(to) || /^src\/routes\/(?!paths\.ts$|types\.ts$)/.test(to))) {
          report('Features may use route paths and types, but must not import application composition')
        }
        if (!typeOnly && fromFeature && /\/(pages|components)\//.test(from) && /^src\/(api\/|features\/[^/]+\/api(?:\/|\.ts$))/.test(to)) {
          report('UI must access server data through feature query/mutation hooks')
        }
        if (!typeOnly) graph.get(file).add(resolved)
      }
    }
    ts.forEachChild(node, inspect)
  }
  inspect(source)
}

const visited = new Set()
const active = new Set()
function visit(file, stack = []) {
  if (active.has(file)) {
    violations.push('Runtime import cycle: ' + [...stack.slice(stack.indexOf(file)), file].map(relative).join(' → '))
    return
  }
  if (visited.has(file)) return
  active.add(file)
  for (const dependency of graph.get(file)) visit(dependency, [...stack, file])
  active.delete(file)
  visited.add(file)
}
for (const file of files) visit(file)

if (violations.length) {
  console.error(violations.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Architecture checks passed for ${files.length} source files: feature boundaries, API layering, and runtime imports.`)
}
