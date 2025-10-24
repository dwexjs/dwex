import { parse as parseCookie } from 'cookie';

/**
 * Cookie parser options.
 */
export interface CookieParserOptions {
  /**
   * Secret for signed cookies.
   */
  secret?: string | string[];

  /**
   * Whether to decode cookie values.
   * @default true
   */
  decode?: (value: string) => string;
}

/**
 * Creates a cookie parser middleware.
 *
 * @param options - Cookie parser options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const app = await DwexFactory.create(AppModule);
 * app.use(cookieParserMiddleware({ secret: 'my-secret' }));
 * ```
 */
export function cookieParserMiddleware(options: CookieParserOptions = {}) {
  const { decode = decodeURIComponent } = options;

  return (req: any, res: any, next: () => void) => {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      req.cookies = {};
      next();
      return;
    }

    try {
      req.cookies = parseCookie(cookieHeader, { decode });
    } catch (error) {
      req.cookies = {};
    }

    next();
  };
}
