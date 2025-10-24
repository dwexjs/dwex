/**
 * Body parser options.
 */
export interface BodyParserOptions {
  /**
   * Maximum request body size.
   * @default '1mb'
   */
  limit?: string | number;

  /**
   * Whether to parse JSON bodies.
   * @default true
   */
  json?: boolean;

  /**
   * Whether to parse URL-encoded bodies.
   * @default true
   */
  urlencoded?: boolean;

  /**
   * Whether to use extended mode for URL-encoded parsing.
   * @default true
   */
  extended?: boolean;
}

/**
 * Parses size strings (e.g., '1mb', '500kb') to bytes.
 */
function parseSize(size: string | number): number {
  if (typeof size === 'number') {
    return size;
  }

  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/i);
  if (!match) {
    return parseInt(size, 10);
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  return Math.floor(value * (units[unit] || 1));
}

/**
 * Creates a body parser middleware.
 *
 * @param options - Body parser options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const app = await DwexFactory.create(AppModule);
 * app.use(bodyParserMiddleware({ limit: '10mb' }));
 * ```
 */
export function bodyParserMiddleware(options: BodyParserOptions = {}) {
  const {
    limit = '1mb',
    json = true,
    urlencoded = true,
  } = options;

  const maxBytes = parseSize(limit);

  return async (req: any, res: any, next: (error?: any) => void) => {
    const contentType = req.headers['content-type'] || '';

    // Skip if no body expected
    if (req.method === 'GET' || req.method === 'HEAD') {
      next();
      return;
    }

    try {
      // JSON body
      if (json && contentType.includes('application/json')) {
        const text = await req.text();

        if (text.length > maxBytes) {
          const error: any = new Error('Request body too large');
          error.status = 413;
          next(error);
          return;
        }

        try {
          req.body = JSON.parse(text);
        } catch (e) {
          const error: any = new Error('Invalid JSON');
          error.status = 400;
          next(error);
          return;
        }
      }
      // URL-encoded body
      else if (urlencoded && contentType.includes('application/x-www-form-urlencoded')) {
        const text = await req.text();

        if (text.length > maxBytes) {
          const error: any = new Error('Request body too large');
          error.status = 413;
          next(error);
          return;
        }

        req.body = Object.fromEntries(new URLSearchParams(text));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
