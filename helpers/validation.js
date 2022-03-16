const Joi = require('@hapi/joi');

module.exports = {
    createUser: Joi.object({
        firstname: Joi.string().min(2).max(30).required(), 
        lastname: Joi.string().min(2).max(30).required(),
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
        username: Joi.string().optional(), 
        phone: Joi.number().min(6).integer().optional(),
        password: Joi.string().min(6).optional(),
        roleId: Joi.string().optional(),
        avatar: Joi.string().optional()
    }),
    loginUser: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
    product: Joi.object({
        name: Joi.string().min(2).required(),
        category: Joi.required(),
        barcode: Joi.optional(),
        supplier: Joi.optional(),
        manufacturer: Joi.optional(),
        price: Joi.number().required(),
        cprice: Joi.number().optional(),
        wprice: Joi.number().optional(),
        quantity: Joi.number().required(),
        pack_q: Joi.optional(),
        shelf: Joi.optional(),
        variant: Joi.optional(),
        left: Joi.optional(),
        expiry: Joi.optional(),
        dispensation: Joi.optional(),
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