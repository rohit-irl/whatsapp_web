export const notFound = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({ message: err.message || "Internal Server Error" });
};
