// middlewares/errorHandler.js
import { errorResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    return errorResponse(res, "Validation failed", 400, err.errors || err.message);
  }

  if (err.name === "UnauthorizedError") {
    return errorResponse(res, "Unauthorized", 401);
  }

  return errorResponse(res, err.message || "Internal Server Error", err.status || 500);
};
