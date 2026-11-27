import assert from "node:assert/strict";
import { renderExplorerHtml } from "../src/ui/explorer.js";

const html = renderExplorerHtml();
const scriptStart = html.lastIndexOf("<script>") + "<script>".length;
const scriptEnd = html.lastIndexOf("</script>");

assert.ok(scriptStart >= "<script>".length && scriptEnd > scriptStart, "Explorer client script is present");
const clientScript = html.slice(scriptStart, scriptEnd);
new Function(clientScript);

const modes = Array.from(html.matchAll(/class="mode-pill[^"]*"[^>]*data-mode="([^"]+)"/g), match => match[1]);
// 35 menu entries: the two interlinear entries (same service) are merged, the
// Resource Catalog moved to a footer link (both still reachable by URL), and
// Compare Translations was added.
assert.equal(modes.length, 35, "Explorer retains the expected tool inventory");
assert.match(clientScript, /MODE_ALIASES = \{ interlinear_lookup: "interlinear_pack" \}/, "Old interlinear links still resolve");
assert.match(html, /href="\?tool=resources&amp;run=1"/, "Resource catalog is reachable from the footer");
assert.equal(new Set(modes).size, modes.length, "Explorer tool identifiers are unique");
assert.match(html, /<option value="ECF">Early Church Fathers Commentary<\/option>/, "ECF is selectable in Single Commentary mode");
assert.match(html, /<option value="Kretzmann">Kretzmann's Popular Commentary<\/option>/, "Kretzmann is selectable in Single Commentary mode");
assert.match(html, /<option value="Schaff">Schaff's Popular NT Commentary<\/option>/, "Schaff is selectable in Single Commentary mode");

for (const category of ["Passage", "Reflection", "Commentary", "Original Words", "Background"]) {
  assert.match(html, new RegExp(">" + category + "</button>"), category + " category is present");
}

assert.doesNotMatch(html, /onclick=/, "Explorer uses event listeners instead of inline click handlers");
assert.match(clientScript, /new AbortController\(\)/, "Requests support cancellation");
assert.match(clientScript, /REQUEST_TIMEOUT_MS = 60000/, "Requests have a bounded timeout");
assert.match(clientScript, /requestId !== requestSequence/, "Stale responses are ignored");
assert.match(clientScript, /window\.history\.replaceState/, "Search state is written to the URL");
assert.match(clientScript, /restoreUrlState\(\)/, "Search state can be restored from the URL");
assert.match(html, /id="btn-share"/, "Results provide a copy-link action");
assert.match(html, /data-action="toggle-section"/, "Expandable sections use delegated actions");
assert.match(html, /@media print/, "Print-specific presentation remains available");
assert.equal((html.match(/:root\s*\{/g) || []).length, 1, "Theme variables have one source of truth");
assert.doesNotMatch(clientScript, /updateContextualControls\(\);\s*executeStudy\(\);\s*$/, "Page load does not automatically request data");
assert.match(clientScript, /get\("run"\) === "1"\) \{\s*executeStudy\(\);/, "Only links with run=1 run the study on load");
assert.match(clientScript, /link\.searchParams\.set\("run", "1"\)/, "Copy link adds run=1");
assert.match(clientScript, /let popoverPinned = false;/, "A click pins the tool menu open instead of toggling it closed");
assert.match(clientScript, /function addChapterNavigation\(navigation\)/, "Read Scripture offers previous/next chapter");
assert.match(clientScript, /function linkifyReferences\(root\)/, "Bible references in results become links");
assert.match(clientScript, /target="_blank" rel="noopener noreferrer">\$1<\/a>/, "Markdown web links render as links");

// Accessibility: contrast, focus, motion and keyboard access.
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const themeBlocks = [html.slice(html.indexOf(":root {"), html.indexOf("}", html.indexOf(":root {"))), html.slice(html.indexOf(':root[data-theme="dark"] {'), html.indexOf("}", html.indexOf(':root[data-theme="dark"] {')))];
for (const block of themeBlocks) {
  const token = (name: string) => block.match(new RegExp(`--${name}: (#[0-9a-f]{6});`))![1];
  for (const bg of ["bg", "surface", "surface-hover", "accent-gold-bg"]) {
    for (const fg of ["text-main", "text-muted", "text-dim"]) assert.ok(contrast(token(fg), token(bg)) >= 4.5, `${fg} on ${bg} meets WCAG AA`);
    assert.ok(contrast(token("focus-outline"), token(bg)) >= 3, `focus outline on ${bg} is visible`);
  }
  for (const bg of ["surface", "input-bg"]) assert.ok(contrast(token("control-border"), token(bg)) >= 3, `form-control border on ${bg} is visible`);
}
assert.match(html, /<a class="skip-link" href="#query-input">/, "Skip link goes to the search box");
assert.match(html, /@media \(prefers-reduced-motion: reduce\)/, "Animations respect reduced motion");
assert.doesNotMatch(clientScript, /behavior: ["']smooth["']/, "Smooth scrolling respects reduced motion");
assert.match(clientScript, /showRefPreview\(refLink, event\.detail === 0\)/, "Keyboard users are moved into verse previews");
assert.match(html, /class="cat-tab active" data-cat="passage" aria-current="true"/, "The selected category is announced");
console.log("Explorer UI regression tests passed.");

// Reading comfort and site features.
assert.match(html, /:root\[data-theme="dark"\] \{/, "Dark theme variables exist");
assert.match(html, /@media \(prefers-color-scheme: dark\)/, "Dark theme follows the system setting");
assert.match(html, /id="btn-theme"/, "Theme switch is present");
assert.match(html, /id="btn-text-larger"/, "Text size controls are present");
assert.match(html, /<meta name="description" content="Free Bible study companion/, "Page has a description for search and link previews");
assert.match(html, /<meta property="og:title"/, "Page has Open Graph tags");
assert.match(html, /id="help-dialog"/, "Help opens in the site");
assert.match(html, /id="btn-save"/, "Studies can be saved");
assert.match(clientScript, /function addPlaceMap\(place\)/, "Places show a map");
assert.match(renderExplorerHtml("", "https://example.org"), /<link rel="canonical" href="https:\/\/example\.org\/">/, "Canonical URL uses the origin");
assert.doesNotMatch(html.slice(html.indexOf("<style>"), html.indexOf("</style>")).replace(/@media print[\s\S]*?\}\s*\}/g, ""), /background: #fff;/, "Surfaces use theme variables");

// The result formatter renders bold, italics and bullets correctly.
const formatterCode = clientScript.slice(clientScript.indexOf("function renderMarkdownTables("), clientScript.indexOf("// Result actions"));
const formatMarkdown = new Function(formatterCode + "; return formatMarkdown;")() as (md: string) => string;
assert.equal(formatMarkdown("Plain *italic* and **bold** here."), "<p>Plain <em>italic</em> and <strong>bold</strong> here.</p>");
assert.match(formatMarkdown("- **Observe:** Read it.\n- **Apply:** Do it."), /<ul><li><strong>Observe:<\/strong> Read it\.<\/li><li><strong>Apply:<\/strong> Do it\.<\/li><\/ul>/);
assert.match(formatMarkdown("* **Type:** Person — *Apostle*"), /<li><strong>Type:<\/strong> Person — <em>Apostle<\/em><\/li>/);
assert.equal(formatMarkdown("2 * 3 = 6 and 4 * 5"), "<p>2 * 3 = 6 and 4 * 5</p>");
assert.match(formatMarkdown("**Map**: [Open in Google Maps](https://maps.google.com/?q=1,2)"), /<a href="https:\/\/maps\.google\.com\/\?q=1,2" target="_blank" rel="noopener noreferrer">Open in Google Maps<\/a>/);
assert.doesNotMatch(formatMarkdown("[click](javascript:alert(1))"), /<a /, "only web links become anchors");
console.log("Explorer formatter checks passed.");
