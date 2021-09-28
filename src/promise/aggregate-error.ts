export class AggregateError extends Error {
  errors: Iterable<unknown>;
  constructor(errors: Iterable<unknown>, message?: string) {
    super(message);
    this.errors = errors;
  }
}
