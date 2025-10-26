import type { OpenAPIObject } from "openapi3-ts/oas31";
import type { OpenApiOptions } from "../interfaces/index.js";

/**
 * Generates the Scalar HTML template for API documentation.
 *
 * @param document - OpenAPI document
 * @param options - Swagger UI options
 * @returns HTML string for Scalar UI
 */
export function generateScalarHTML(
	document: OpenAPIObject,
	options: OpenApiOptions = {},
): string {
	const {
		customSiteTitle = document.info?.title || "API Documentation",
		customfavIcon,
		darkMode = true,
	} = options;

	const specJson = JSON.stringify(document, null, 2);

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${customSiteTitle}</title>
  ${customfavIcon ? `<link rel="icon" href="${customfavIcon}">` : ""}
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <script
    id="api-reference"
    data-url=""
    data-configuration='${JSON.stringify({
			theme: darkMode ? "kepler" : "default",
			darkMode,
			layout: "modern",
			showSidebar: true,
			hideModels: false,
			hideDownloadButton: true,
			searchHotKey: "k",
		})}'
  ></script>
  <script>
    // Inject the OpenAPI spec directly
    const script = document.getElementById('api-reference');
    script.dataset.configuration = JSON.stringify({
      ...JSON.parse(script.dataset.configuration),
      spec: {
        content: ${specJson}
      }
    });
  </script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`;
}
