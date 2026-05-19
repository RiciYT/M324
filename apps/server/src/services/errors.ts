export type ServiceErrorStatus = 400 | 401 | 403 | 404 | 409 | 429;

export class ServiceError extends Error {
  readonly status: ServiceErrorStatus;

  constructor(status: ServiceErrorStatus, message: string) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
  }
}
