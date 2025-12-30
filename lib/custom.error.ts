import { IServerErrorResponse } from "@/types/interfaces";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly path: string;
  public readonly timestamp: string;
  public readonly error?: string;
  public readonly success: boolean;

  constructor(error: Partial<IServerErrorResponse>) {
    super(error.message);

    this.statusCode = error.statusCode || 500;
    this.path = error.path || "";
    this.timestamp = error.timestamp || new Date().toISOString();
    this.error = error.error;
    this.success = error.success || false;

    // Preserve stack trace
    if (error.stack) {
      this.stack = error.stack;
    }

    // Set prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
