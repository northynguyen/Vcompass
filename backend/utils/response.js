// utils/response.js
export const successResponse = (res, data = null, message = "Success", status = 200) => {
  return res.status(status).json({
    status: "success",
    message,
    data,
  });
};

export const errorResponse = (res, message = "Error", status = 500, errors = null) => {
  return res.status(status).json({
    status: "error",
    message,
    errors,
  });
};

export const paginationResponse = (res, data, pagination, message = "Success", status = 200) => {
  return res.status(status).json({
    status: "success",
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};
