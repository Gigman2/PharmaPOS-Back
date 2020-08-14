const Joi = require('@hapi/joi');

module.exports = {
    createUser: Joi.object({
        firstname: Joi.string().min(2).max(30).required(), 
        lastname: Joi.string().min(2).max(30).required(),
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
        phone: Joi.number().min(6).integer().optional(),
        password: Joi.string().min(6).optional(),
        role: Joi.string().optional(),
        avatar: Joi.string().optional()
    }),
    loginUser: Joi.object({
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
        password: Joi.string().required(),
    }),
    product: Joi.object({
        name: Joi.string().min(2).required(),
        category: Joi.required(),
        barcode: Joi.string().pattern(/^[a-zA-Z0-9_-]*$/).optional(),
        sku: Joi.string().pattern(/^[a-zA-Z0-9_-]*$/).optional(),
        supplier: Joi.optional(),
        manufacturer: Joi.string().optional(),
        price: Joi.number().required(),
        quantity: Joi.number().required(),
        shelf: Joi.string().alphanum().optional(),
        restock: Joi.number().optional()
    }),
    category: Joi.object({
        name: Joi.string().min(2).required(),
    }),
    supplier: Joi.object({
        name: Joi.string().min(2).required(),
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
        phone: Joi.number().min(6).integer().optional(),
    })
}