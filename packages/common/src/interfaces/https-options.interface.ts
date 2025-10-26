import { BunFile } from "bun";

/**
 * TLS/HTTPS configuration options for Dwex server.
 * Based on Bun's TLS configuration: https://bun.com/docs/runtime/http/tls
 */
export interface HttpsOptions {
  /**
   * Path to TLS certificate file or the certificate content as a string.
   * Can also be a BunFile instance.
   *
   * @example
   * ```typescript
   * // Using file path
   * cert: './cert.pem'
   *
   * // Using BunFile
   * cert: Bun.file('./cert.pem')
   *
   * // Using inline content
   * cert: '-----BEGIN CERTIFICATE-----\n...'
   * ```
   */
  cert: string | BunFile;

  /**
   * Path to TLS private key file or the key content as a string.
   * Can also be a BunFile instance.
   *
   * @example
   * ```typescript
   * // Using file path
   * key: './key.pem'
   *
   * // Using BunFile
   * key: Bun.file('./key.pem')
   *
   * // Using inline content
   * key: '-----BEGIN PRIVATE KEY-----\n...'
   * ```
   */
  key: string | BunFile;

  /**
   * Optional passphrase for the private key.
   *
   * @example
   * ```typescript
   * passphrase: 'my-secret-passphrase'
   * ```
   */
  passphrase?: string;

  /**
   * Optional Certificate Authority (CA) certificate.
   * Can be a file path, string content, or BunFile instance.
   *
   * @example
   * ```typescript
   * ca: './ca.pem'
   * ```
   */
  ca?: string | BunFile;

  /**
   * Optional path to Diffie-Hellman parameters file.
   *
   * @example
   * ```typescript
   * dhParamsFile: './dhparams.pem'
   * ```
   */
  dhParamsFile?: string;
}
