class ApiResponseHandler {
  public code: number;
  public message: string;
  public data?: unknown;
  public role?: string;

  constructor(code: number, message: string, data?: unknown, role?: string) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.role = role;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
      role: this.role,
    };
  }
}

export default ApiResponseHandler;
