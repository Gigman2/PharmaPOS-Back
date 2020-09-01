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
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
    product: Joi.object({
        name: Joi.string().min(2).required(),
        category: Joi.required(),
        barcode: Joi.string().pattern(/^[a-zA-Z0-9_-]*$/).optional(),
        sku: Joi.optional(),
        supplier: Joi.optional(),
        manufacturer: Joi.optional(),
        price: Joi.number().required(),
        quantity: Joi.number().required(),
        shelf: Joi.optional(),
        restock: Joi.number().optional(),
        generics: Joi.optional(),
        expiry: Joi.optional(),
        batch: Joi.optional(),
        lprice: Joi.optional(),
        lquantity: Joi.optional(),
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