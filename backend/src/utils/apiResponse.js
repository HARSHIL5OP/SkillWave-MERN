export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode = 500, message = 'Internal Server Error', error = null) => {
  const response = {
    success: false,
    message,
  };
  if (error) {
    response.error = error;
  }
  return res.status(statusCode).json(response);
};
