const Joi = require('@hapi/joi');

module.exports = {
    createUser: Joi.object({
        firstname: Joi.string().min(2).max(30).required(), 
        lastname: Joi.string().min(2).max(30).required(),
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
        phone: Joi.number().min(6).integer().optional(),
        // password: Joi.string().min(6).required(),
        role: Joi.string().optional(),
        avatar: Joi.string().optional()
    }),
    loginUser: Joi.object({
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
        password: Joi.string().required(),
    })
}