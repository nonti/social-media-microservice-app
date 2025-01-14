import Joi  from 'joi';

export const validateRegistration = (data) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
  })

  return schema.validate(data);
}

