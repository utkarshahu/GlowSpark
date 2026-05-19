const Joi = require("joi");


module.exports.productSchema = Joi.object({
    product: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required(),
        brand: Joi.string().required(),
        category: Joi.string().valid('Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Bath & Body').required(),
        image: Joi.string().allow("", null),
        images: Joi.array().items(Joi.object({
            url: Joi.string().required(),
            filename: Joi.string().required()
        }).unknown(true)).allow(null),
        thumbnailIndex: Joi.number().min(0).allow("", null),
        isNewArrival: Joi.boolean().allow(null),
        stock: Joi.number().min(0).allow("", null),
        ingredients: Joi.string().allow("", null)
    }).unknown(true).required(),
});


module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required(),
});

module.exports.userSignupSchema = Joi.object({
    username: Joi.string().required().min(3).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6)
});

module.exports.userLoginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
});

module.exports.userProfileSchema = Joi.object({
    username: Joi.string().min(3).max(30).allow("", null),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).allow("", null),
    addresses: Joi.array().items(Joi.object({
        houseNo: Joi.string().allow("", null),
        street: Joi.string().allow("", null),
        city: Joi.string().allow("", null),
        state: Joi.string().allow("", null),
        pincode: Joi.string().allow("", null),
        country: Joi.string().allow("", null),
        isDefault: Joi.boolean()
    })),
    oldPassword: Joi.string().min(6).allow("", null),
    newPassword: Joi.string().min(6).allow("", null)
});