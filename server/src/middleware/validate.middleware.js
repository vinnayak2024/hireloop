// Middleware factory that validates request body, query, or params against a Zod schema
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.') || 'root';
        fieldErrors[path] = issue.message;
      });

      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: fieldErrors
        }
      });
    }

    // Replace the validated source with parsed/coerced data
    req[source] = result.data;
    next();
  };
};

module.exports = validate;
