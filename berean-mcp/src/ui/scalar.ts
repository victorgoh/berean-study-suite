/**
 * Scalar API Reference & Interactive Playground
 * Industry-standard open-source interactive documentation & API testing client
 */

export function renderScalarHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <title>Berean MCP Server — Interactive API Playground</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #07090e;
      }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/openapi.json"
      data-configuration='{
        "theme": "purple",
        "darkMode": true,
        "showSidebar": true,
        "searchHotKey": "k",
        "layout": "modern",
        "metaData": {
          "title": "Berean MCP Server — Interactive API Playground"
        }
      }'
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
}
