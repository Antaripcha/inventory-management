/** Standard API response envelope used by every controller. */
export class ApiResponse {
  constructor(statusCode, data = null, message = "Success", meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }
}

export function sendSuccess(res, { statusCode = 200, data = null, message = "Success", meta = null }) {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message, meta));
}
