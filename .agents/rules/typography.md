# Typography and Formatting Rule

## 1. Absolute Prohibition of LaTeX Math Notation
- **Never use LaTeX math markers**: Strictly forbidden: `$\rightarrow$`, `\rightarrow`, `\implies`, `$\implies$`, `\text{...}`, `$$...$$`, `\approx`.
- **Always use literal Unicode characters**: Use literal `→` (arrows), `⇒` (double arrows), `▶` (bullet pointers), and standard bold `**word**` instead of `\text{word}`.

## 2. Prohibition of Fragile ASCII Box Art Diagrams
- **Never generate multi-line ASCII box drawings**: (e.g. `┌──┐`, `└──┘`, multi-line fixed-pitch banners). They distort and break on mobile screens, Markdown readers, and Microsoft Word (`.docx`) exports due to line wrapping.
- **Always use Native Markdown Tables**: For comparisons, frameworks, multi-column metrics, and contrast analyses, use standard Markdown tables (`| Col 1 | Col 2 |`). Tables automatically resize responsively and format into native styled tables in Word.
- **Always use Linear Bullet Sequences**: For sequential thought progressions, use bold terms with Unicode arrows (e.g. `**Step 1** → **Step 2** → **Step 3**`).

## 3. Scope of Enforcement
- Applies universally to all conversational messages, study outputs, manuscripts, and file exports.
