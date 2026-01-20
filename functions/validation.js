const Joi = require("joi");

const productSchema = Joi.object({
    name: Joi.string().min(3).required(),
    category: Joi.string().required(),
    brand: Joi.string().required(),
    // price: Joi.number().strict().required(),
    description: Joi.string().min(10).required(),
    barcodes: Joi.array(),
    material: Joi.string(),
    color: Joi.string(),
    // size: Joi.array().items(Joi.string().required()),
    variations: Joi.array(),
    images: Joi.array().items(Joi.string().required()),
    stockLevel: Joi.number().integer().min(0).required(),
    tags: Joi.array(),
    weight: Joi.string(),
    dimensions: Joi.string(),
    stockAvailability: Joi.string(),
    fit: Joi.string(),
    status: Joi.string().valid("published", "non-published").required(),
    marketStatus: Joi.string().valid("normal", "onsale", "clearance").required(),
    discountType: Joi.string().valid("none", "percentage", "fixed price"),
    taxClass: Joi.string().valid("tax free", "vat").required(),
    taxPercent: Joi.number().required(),
    style: Joi.array(),
    composition: Joi.array(),
    care: Joi.array(),
});

// const updateProductSchema

// const customerSchema;

// const adminSchema;

// const orderSchema;

// const updateOrderSchema

// const cartSchema;

exports.productSchema = productSchema;
