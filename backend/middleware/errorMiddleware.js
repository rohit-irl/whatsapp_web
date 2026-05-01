export const notFound = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  
  // Mask ugly MongoDB / OpenSSL internal errors
  let message = err.message || "Internal Server Error";
  if (message.includes("SSL routines") || message.includes("tlsv1 alert") || message.includes("MongoNetworkError")) {
    message = "Database connection error. Please verify your connection or restart the server.";
  }
  
  res.status(statusCode).json({ message });
};
