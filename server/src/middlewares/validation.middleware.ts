import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(", ");
            return res.status(400).json({ message: errorMessage });
        }
        next();
    };
};

export const productSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().min(0).required(),
    startup: Joi.string().required(),
    description: Joi.string(),
    variants: Joi.array().items(Joi.object({
        color: Joi.string().required(),
        size: Joi.string().required(),
        stock: Joi.number().min(0).required()
    })),
    images: Joi.array().items(Joi.string())
});

export const collectionSchema = Joi.object({
    uid: Joi.string(),
    name: Joi.string().required(),
    tagline: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.string().valid("upcoming", "live", "ended").required(),
    startDate: Joi.string().required(),
    startups: Joi.array().items(Joi.string()),
    products: Joi.array().items(Joi.string())
});

export const startupSchema = Joi.object({
    uid: Joi.string().required(),
    name: Joi.string().required(),
    tagline: Joi.string().required(),
    description: Joi.string().required(),
    url: Joi.string().uri().allow(""),
    status: Joi.string().valid("active", "archived").default("active"),
    logo: Joi.array().items(Joi.object({
        bg: Joi.string().required(),
        src: Joi.string().required()
    })),
    icons: Joi.array().items(Joi.object({
        bg: Joi.string().required(),
        src: Joi.string().required()
    }))
});

export const updateStartupSchema = Joi.object({
    uid: Joi.string(),
    name: Joi.string(),
    tagline: Joi.string(),
    description: Joi.string(),
    url: Joi.string().uri().allow(""),
    status: Joi.string().valid("active", "archived"),
    logo: Joi.array().items(Joi.object({
        bg: Joi.string().required(),
        src: Joi.string().required()
    })),
    icons: Joi.array().items(Joi.object({
        bg: Joi.string().required(),
        src: Joi.string().required()
    }))
});

export const orderSchema = Joi.object({
    items: Joi.array().items(Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().required(),
        variant: Joi.any()
    })).required(),
    shippingAddress: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().required(),
        country: Joi.string().required()
    }).required(),
    status: Joi.string().valid("PENDING", "PROCESSING", "FULFILLED", "CANCELLED")
});

export const couponSchema = Joi.object({
    code: Joi.string().required(),
    discountType: Joi.string().valid("shipping", "commodity").required(),
    valueType: Joi.string().valid("percentage", "fixed").required(),
    value: Joi.number().min(0).required(),
    scope: Joi.string().valid("all", "product", "collection", "drop", "order").required(),
    targetIds: Joi.array().items(Joi.string()),
    orderThresholds: Joi.object({
        min: Joi.number().min(0),
        max: Joi.number().min(0)
    }),
    status: Joi.string().valid("active", "expired"),
    expiryDate: Joi.string().isoDate().allow(null, "")
});

export const scheduleSchema = Joi.object({
    uid: Joi.string(),
    title: Joi.string().required(),
    startDate: Joi.string().required(),
    startTime: Joi.string().required(),
    endDate: Joi.string().required(),
    endTime: Joi.string().required(),
    type: Joi.string().valid("collection", "product").required(),
    targetIds: Joi.array().items(Joi.string()).required()
});

