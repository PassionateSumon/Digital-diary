class ApiErrorHandler {
  public code: number;
  public message: string | unknown;

  constructor(code: number, message: string | unknown) {
    this.code = code;
    this.message = message;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

export default ApiErrorHandler;
