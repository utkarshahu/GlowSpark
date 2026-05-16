const Joi = require("joi");


module.exports.productSchema = Joi.object({
    product: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required(),
        brand: Joi.string().required(),
        category: Joi.string().valid('Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Bath & Body').required(),
        image: Joi.string().allow("", null),
        stock: Joi.number().min(0).allow("", null),
        ingredients: Joi.string().allow("", null)
    }).required(),
});


module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required(),
});