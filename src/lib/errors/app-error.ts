import 'server-only';
import { ErrorCode } from './codes';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly cause?: unknown;
  public readonly requestId?: string;
  private readonly publicMessage?: string;

  constructor(
    code: ErrorCode, 
    message: string, // Internal diagnostic message (logged securely)
    statusCode = 500, 
    isOperational = true, 
    cause?: unknown,
    requestId?: string,
    publicMessage?: string // Explicitly approved safe public message
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.cause = cause;
    this.requestId = requestId;
    this.publicMessage = publicMessage;
    
    // Explicitly inherit correct prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  // Safe public serialization
  public serialize() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.publicMessage || (this.statusCode === 500 ? 'An unexpected error occurred.' : 'A request validation error occurred.'),
        ...(this.requestId ? { requestId: this.requestId } : {}),
      },
    };
  }
}
