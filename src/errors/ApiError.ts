type ErrorResponse = {
  message: string;
  path?: string;
  details?: { message: string }[];
  errorCode?: string;
  timestamp: string;
};

export class ApiError extends Error implements ErrorResponse {
  statusCode: number;
  path?: string;
  details?: { message: string }[];
  errorCode?: string;
  timestamp: string;

  constructor(message: string, statusCode: number);
  constructor(message: string, statusCode: number, errorCode: string);

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    this.timestamp = new Date().toISOString();

    if (errorCode) {
      this.errorCode = errorCode;
    }
  }

  setPath(path: string) {
    this.path = path;
  }

  setDetails(details?: { message: string }[]) {
    this.details = details;
  }

  toJSON(): ErrorResponse {
    return {
      message: this.message,
      path: this.path || undefined,
      timestamp: this.timestamp,
      details: this.details || undefined,
      errorCode: this.errorCode || undefined,
    };
  }
}
