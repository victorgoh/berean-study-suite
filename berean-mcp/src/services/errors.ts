/**
 * Typed service errors.
 *
 * Services return `{ error, errorCode }` instead of throwing. The REST layer
 * maps `errorCode` straight to an HTTP status, so status codes no longer depend
 * on the wording of error messages. Codes match the public contract in
 * docs/agent-mcp-server-design.md.
 */
export type ServiceErrorCode =
  | "REQUEST_FAILED" // 400: the request itself is unusable (bad reference, unknown source, missing term)
  | "RESOURCE_UNAVAILABLE" // 404: valid request, but nothing matches it
  | "DEPENDENCY_UNAVAILABLE" // 503: R2/D1 data could not be reached or opened
  | "INTERNAL_ERROR"; // 500: unexpected failure while querying

export const HTTP_STATUS_FOR_ERROR: Readonly<Record<ServiceErrorCode, number>> = {
  REQUEST_FAILED: 400,
  RESOURCE_UNAVAILABLE: 404,
  DEPENDENCY_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500
};

export interface ServiceError {
  error: string;
  errorCode: ServiceErrorCode;
}

/** The request is unusable as given (400). */
export const invalidRequest = (message: string): ServiceError => ({ error: message, errorCode: "REQUEST_FAILED" });

/** The request is valid but nothing matches it (404). */
export const notFound = (message: string): ServiceError => ({ error: message, errorCode: "RESOURCE_UNAVAILABLE" });

/** Backing data (R2 object, D1 database, index file) is missing or unreadable (503). */
export const dependencyUnavailable = (message: string): ServiceError => ({
  error: message,
  errorCode: "DEPENDENCY_UNAVAILABLE"
});

/**
 * Unexpected failure (500). The underlying error is logged for the Worker logs
 * only; the client gets a stable message without internals such as SQL text.
 */
export function internalError(operation: string, cause: unknown): ServiceError {
  console.error(`${operation} failed:`, cause);
  return { error: `${operation} failed due to an internal error.`, errorCode: "INTERNAL_ERROR" };
}

/** Error fields every service result may carry. */
export interface ServiceErrorFields {
  error?: string;
  errorCode?: ServiceErrorCode;
}
