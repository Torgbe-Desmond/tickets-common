import { ValidationError } from 'express-validator';
import { CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super('Invalid request parameters');

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      // Support both older (param) and newer (path) express-validator shapes
      const field = 'path' in err ? (err as any).path : (err as any).param;
      return { message: err.msg, field };
    });
  }
}

