import { AppError } from './app-error.js';

export interface FieldIssue {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly details: FieldIssue[];

  constructor(details: FieldIssue[], message = 'Validation failed') {
    super(message);
    this.details = details;
  }
}
