import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const distDir = path.resolve(projectRoot, 'dist')
const distIndexHtmlPath = path.resolve(distDir, 'index.html')
const outSingleHtmlPath = path.resolve(projectRoot, 'single.html')

async function readText(filePath) {
  return await fs.readFile(filePath, 'utf8')
}

function isExternalUrl(href) {
  return /^https?:\/\//i.test(href) || href.startsWith('//')
}

function resolveDistAsset(hrefOrSrc) {
  // Vite emits href/src like "/assets/xxx.css" or "assets/xxx.css" (with base './')
  const cleaned = hrefOrSrc.replace(/^\.\//, '').replace(/^\//, '')
  return path.resolve(distDir, cleaned)
}

function parseTagAttributes(tag) {
  // Parses attributes from a start-tag string into a map.
  // Supports: key="value", key='value', key=value, and boolean attributes.
  const attrs = new Map()
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  for (const m of tag.matchAll(re)) {
    const key = m[1].toLowerCase()
    const value = m[2] ?? m[3] ?? m[4] ?? ''
    attrs.set(key, value)
  }
  return attrs
}

async function inlineCss(html) {
  // Inline all <link ...> tags where rel=stylesheet and href points to dist assets.
  const linkTagRe = /<link\b[^>]*?>/gi
  const tags = [...html.matchAll(linkTagRe)].map((m) => m[0])

  for (const fullTag of tags) {
    const attrs = parseTagAttributes(fullTag)
    const rel = (attrs.get('rel') ?? '').toLowerCase()
    if (rel !== 'stylesheet') continue

    const href = attrs.get('href') ?? ''
    if (!href || isExternalUrl(href)) continue

    const cssPath = resolveDistAsset(href)
    const css = await readText(cssPath)
    const styleTag = `<style>\n${css}\n</style>`
    // Use a function replacement so `$` sequences in CSS aren't interpreted by String.replace.
    html = html.replace(fullTag, () => styleTag)
  }

  return html
}

function removeModulePreloads(html) {
  // Not needed once everything is inlined into a single module script.
  return html.replace(/<link\b[^>]*?rel=["']modulepreload["'][^>]*?>\s*/gi, '')
}

async function inlineModuleScripts(html) {
  // Inline <script ...></script> tags where type=module and src points to dist assets.
  const scriptTagRe = /<script\b[^>]*?>\s*<\/script>/gi
  const tags = [...html.matchAll(scriptTagRe)].map((m) => m[0])

  for (const fullTag of tags) {
    const openTag = fullTag.replace(/<\/script>\s*$/i, '')
    const attrs = parseTagAttributes(openTag)
    const type = (attrs.get('type') ?? '').toLowerCase()
    if (type !== 'module') continue

    const src = attrs.get('src') ?? ''
    if (!src || isExternalUrl(src)) continue

    const jsPath = resolveDistAsset(src)
    let js = await readText(jsPath)
    // Remove sourcemap references to avoid 404 noise when opening the single file.
    js = js.replace(/^\s*\/\/# sourceMappingURL=.*$/gm, '').trimEnd()
    // IMPORTANT: Prevent the HTML parser from prematurely terminating the inline script
    // if the JS bundle contains a literal "</script" substring (even inside strings).
    js = js.replace(/<\/script/gi, '<\\/script')

    const inlineTag = `<script type="module">\n${js}\n</script>`
    // Use a function replacement so `$` sequences in the JS bundle aren't interpreted
    // (e.g. "$&" would otherwise expand to the matched substring and corrupt the bundle).
    html = html.replace(fullTag, () => inlineTag)
  }

  return html
}

async function main() {
  let html = await readText(distIndexHtmlPath)

  html = removeModulePreloads(html)
  html = await inlineCss(html)
  html = await inlineModuleScripts(html)

  await fs.writeFile(outSingleHtmlPath, html, 'utf8')
  // eslint-disable-next-line no-console
  console.log(`Wrote: ${path.relative(projectRoot, outSingleHtmlPath)}`)
}

await main()


