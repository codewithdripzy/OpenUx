import Joi from "joi";

const createProjectDto = Joi.object({
    name: Joi.string().trim().min(3).required(),
    description: Joi.string().trim().optional(),
    prompt: Joi.string().trim().optional(),
    model: Joi.string().optional(),
});

const updateProjectDto = Joi.object({
    name: Joi.string().trim().min(3).optional(),
    description: Joi.string().trim().optional(),
    prompt: Joi.string().trim().optional(),
    model: Joi.string().optional(),
}).min(1);

export { createProjectDto, updateProjectDto };
