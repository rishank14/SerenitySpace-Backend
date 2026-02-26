const errorMiddleware = (err, req, res, next) => {
   // Handle Mongoose validation errors
   if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
         success: false,
         message: messages.join(", ") || "Validation failed",
         errors: messages,
      });
   }

   // Handle Mongoose duplicate key errors
   if (err.code === 11000) {
      const field = Object.keys(err.keyValue).join(", ");
      return res.status(409).json({
         success: false,
         message: `Duplicate value for: ${field}`,
         errors: [],
      });
   }

   const statusCode = err.statusCode || 500;

   return res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
      errors: err.errors || [],
   });
};

export default errorMiddleware;
