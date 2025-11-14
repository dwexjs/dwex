import type { MiddlewareFunction } from "@dwex/common";
import type { ServeStaticOptions } from "@dwex/common";
import { join, normalize, sep } from "node:path";

/**
 * MIME type mappings for common file extensions
 */
const MIME_TYPES: Record<string, string> = {
	".html": "text/html",
	".css": "text/css",
	".js": "application/javascript",
	".json": "application/json",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".eot": "application/vnd.ms-fontobject",
	".otf": "font/otf",
	".txt": "text/plain",
	".xml": "application/xml",
	".pdf": "application/pdf",
	".zip": "application/zip",
	".mp4": "video/mp4",
	".webm": "video/webm",
	".mp3": "audio/mpeg",
	".wav": "audio/wav",
	".webp": "image/webp",
};

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
	const ext = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
	return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Check if a path is safe (doesn't escape root directory)
 */
function isSafePath(rootPath: string, resolvedPath: string): boolean {
	const normalizedRoot = normalize(rootPath);
	const normalizedPath = normalize(resolvedPath);
	return normalizedPath.startsWith(normalizedRoot + sep) || normalizedPath === normalizedRoot;
}

/**
 * Creates middleware for serving static files
 *
 * @param options - Configuration options for static file serving
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const app = await DwexFactory.create(AppModule);
 * app.use(createServeStaticMiddleware({
 *   rootPath: './public',
 *   serveRoot: '/static',
 *   spa: true
 * }));
 * await app.listen(3000);
 * ```
 */
export function createServeStaticMiddleware(
	options: ServeStaticOptions,
): MiddlewareFunction {
	const {
		rootPath,
		serveRoot = "/",
		spa = false,
		indexFile = "index.html",
		dotfiles = "ignore",
		exclude = [],
	} = options;

	// Resolve root path to absolute path
	const absoluteRootPath = join(process.cwd(), rootPath);

	return async (req, res, next) => {
		// Only handle GET and HEAD requests
		if (req.method !== "GET" && req.method !== "HEAD") {
			return next();
		}

		// Check if request path starts with serveRoot
		const urlPath = new URL(req.url, "http://localhost").pathname;
		if (!urlPath.startsWith(serveRoot)) {
			return next();
		}

		// Check if path matches any exclude patterns
		for (const excludePath of exclude) {
			if (urlPath.startsWith(excludePath)) {
				return next();
			}
		}

		// Remove serveRoot prefix to get relative path
		let relativePath = urlPath.slice(serveRoot.length);
		if (relativePath.startsWith("/")) {
			relativePath = relativePath.slice(1);
		}

		// Handle dotfiles
		if (relativePath.includes("/.")) {
			const segments = relativePath.split("/");
			const hasDotfile = segments.some((seg) => seg.startsWith("."));

			if (hasDotfile) {
				if (dotfiles === "deny") {
					res.statusCode = 403;
					res.end("Forbidden");
					return;
				}
				if (dotfiles === "ignore") {
					return next();
				}
			}
		}

		// Resolve file path
		let filePath = join(absoluteRootPath, relativePath || "");

		// Security check: ensure path doesn't escape root
		if (!isSafePath(absoluteRootPath, filePath)) {
			res.statusCode = 403;
			res.end("Forbidden");
			return;
		}

		try {
			const file = Bun.file(filePath);
			const exists = await file.exists();

			if (exists) {
				const stat = await file.stat();

				// If it's a directory, try to serve index file
				if (stat.isDirectory()) {
					filePath = join(filePath, indexFile);
					const indexFileHandle = Bun.file(filePath);
					const indexExists = await indexFileHandle.exists();

					if (!indexExists) {
						// Directory without index file
						if (spa) {
							// Serve root index.html for SPA
							filePath = join(absoluteRootPath, indexFile);
						} else {
							return next();
						}
					}
				}
				// File exists, continue to serve it below
			} else {
				// File doesn't exist
				if (spa && !relativePath.includes(".")) {
					// For SPA mode: serve index.html for non-file routes (no extension)
					// This handles client-side routes like /about, /contact, etc.
					filePath = join(absoluteRootPath, indexFile);
				} else {
					// Not SPA mode or has extension - pass to next middleware/router
					return next();
				}
			}

			// Serve the file
			const finalFile = Bun.file(filePath);
			const finalExists = await finalFile.exists();

			if (!finalExists) {
				return next();
			}

			// Set content type header
			const mimeType = getMimeType(filePath);
			res.setHeader("Content-Type", mimeType);

			// Set caching headers for static assets
			if (relativePath.includes(".")) {
				// Cache static assets for 1 year
				res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
			} else {
				// Don't cache HTML files (for SPA updates)
				res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
			}

			// Send file
			res.body = await finalFile.arrayBuffer();
			// Call next() to resolve the middleware promise
			// The application will check res.body and return early
			next();
		} catch (error) {
			// Error reading file, pass to next middleware
			next();
		}
	};
}
