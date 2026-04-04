const validate = (schema) => {
  return (req, res, next) => {
    const targets = {};
    if (schema.body) targets.body = req.body;
    if (schema.params) targets.params = req.params;
    if (schema.query) targets.query = req.query;

    for (const [key, joiSchema] of Object.entries(schema)) {
      if (!targets[key]) continue;
      const { error, value } = joiSchema.validate(targets[key], {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        const messages = error.details.map((d) => d.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: messages,
        });
      }
      req[key] = value;
    }
    next();
  };
};

module.exports = { validate };
