export interface IServerErrorResponse {
  statusCode: number;
  path: string;
  timestamp: string;
  message: string;
  stack: string;
  error?: string;
  success: boolean;
}
