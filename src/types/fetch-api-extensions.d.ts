/**
 * Type declarations for extending the Fetch API
 * 
 * This file adds support for newer Fetch API features that might not be
 * included in the current TypeScript lib definitions.
 */

interface Response {
  /**
   * Takes a Response stream and reads it to completion.
   * Returns a promise that resolves with a Uint8Array.
   * 
   * @returns A promise that resolves with a Uint8Array.
   * @throws {TypeError} If the response body is disturbed or locked.
   * @throws {DOMException} If the request was aborted.
   * @throws {RangeError} If there was a problem creating the associated ArrayBuffer.
   * 
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Response/bytes
   */
  bytes(): Promise<Uint8Array>;
}
