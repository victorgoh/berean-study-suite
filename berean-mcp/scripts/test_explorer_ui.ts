import assert from "node:assert/strict";
import { renderExplorerHtml } from "../src/ui/explorer.js";

const html = renderExplorerHtml();
const scriptStart = html.lastIndexOf("<script>") + "<script>".length;
const scriptEnd = html.lastIndexOf("</script>");

assert.ok(scriptStart >= "<script>".length && scriptEnd > scriptStart, "Explorer client script is present");
const clientScript = html.slice(scriptStart, scriptEnd);
new Function(clientScript);

const modes = Array.from(html.matchAll(/class="mode-pill[^"]*"[^>]*data-mode="([^"]+)"/g), match => match[1]);
assert.equal(modes.length, 36, "Explorer retains the expected tool inventory");
assert.equal(new Set(modes).size, modes.length, "Explorer tool identifiers are unique");
assert.match(html, /<option value="ECF">Early Church Fathers Commentary<\/option>/, "ECF is selectable in Single Commentary mode");

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

console.log("Explorer UI regression tests passed.");
