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

async function inlineCss(html) {
  // Inline all stylesheet links that point to dist assets
  const linkRe =
    /<link\b([^>]*?)rel=["']stylesheet["']([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi

  const matches = [...html.matchAll(linkRe)]
  for (const m of matches) {
    const fullTag = m[0]
    const href = m[3]
    if (isExternalUrl(href)) continue

    const cssPath = resolveDistAsset(href)
    const css = await readText(cssPath)
    const styleTag = `<style>\n${css}\n</style>`
    html = html.replace(fullTag, styleTag)
  }

  return html
}

function removeModulePreloads(html) {
  // Not needed once everything is inlined into a single module script.
  return html.replace(/<link\b[^>]*?rel=["']modulepreload["'][^>]*?>\s*/gi, '')
}

async function inlineModuleScripts(html) {
  // Inline <script type="module" src="..."></script>
  const scriptRe =
    /<script\b([^>]*?)type=["']module["']([^>]*?)src=["']([^"']+)["']([^>]*)>\s*<\/script>/gi

  const matches = [...html.matchAll(scriptRe)]
  for (const m of matches) {
    const fullTag = m[0]
    const src = m[3]
    if (isExternalUrl(src)) continue

    const jsPath = resolveDistAsset(src)
    const js = await readText(jsPath)
    const inlineTag = `<script type="module">\n${js}\n</script>`
    html = html.replace(fullTag, inlineTag)
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


