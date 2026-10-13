/**
 * Error raised for any non-2xx API response or network failure.
 * `status` is 0 when the API could not be reached at all.
 */
export class ApiError extends Error {
  readonly status: number;
  /** The `{ message }` sent by the API, if any (English, as written by the backend). */
  readonly apiMessage: string | null;

  constructor(status: number, apiMessage: string | null) {
    super(apiMessage ?? (status === 0 ? "API unreachable" : `API responded with status ${status}`));
    this.name = "ApiError";
    this.status = status;
    this.apiMessage = apiMessage;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}
