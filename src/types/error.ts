export class CustomError extends Error {
  public message: string;
  public status: number;
  public details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.message = message;
    this.status = status;
    this.details = details;
  }
}
