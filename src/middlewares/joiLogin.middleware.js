// import joi from "@hapi/joi"
// import { asyncHandler } from "../utils/asyncHandler.js"



// const authSchema = asyncHandler(async(req,_, next) =>{

//     const schema = joi.object({
//         Email: joi.string().email().lowercase().required(),
//         Password: joi.string().min(6).max(16).required()
//     })
    
//     const result = await schema.validateAsync(req.body)


//     req.user = result
//     next()
// })


// export {authSchema}

import Joi from "@hapi/joi";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const authSchema = asyncHandler(async (req, _, next) => {
    const schema = Joi.object({
        Email: Joi.string().email().lowercase().required(),
        Password: Joi.string().min(6).max(16).required()
    });

    try {
        const result = await schema.validateAsync(req.body);
        req.user = result;
        next();
    } catch (err) {
        throw new ApiError(400, err.details?.[0]?.message || "Invalid input");
    }
});

export { authSchema };


