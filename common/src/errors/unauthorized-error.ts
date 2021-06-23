import { CustomError } from "./custom-error";

export class UnauthorizedError extends CustomError {
  statusCode = 401;
  serializeErrors() {
    return [{ message: "Unauthorized" }];
  }
  constructor() {
    super("Unauthorized");
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
