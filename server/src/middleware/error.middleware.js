// Centralized Express error handler
// Conforms strictly to error shape: { error: { message, details? } }

const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || undefined;

  // Handle Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = err.meta?.target ? err.meta.target.join(', ') : 'Field';
    message = `${target} already exists`;
  }

  // Handle Prisma record not found (P2025)
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Handle JSON parse syntax errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  const response = {
    error: {
      message
    }
  };

  if (details) {
    response.error.details = details;
  }

  // Log 500 errors in development for debugging
  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('[SERVER ERROR]', err);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
