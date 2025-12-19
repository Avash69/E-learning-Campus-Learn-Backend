// import {asyncHandler} from "../utils/asyncHandler.js";
// import {ApiError} from "../utils/ApiError.js";
// import { admin } from "../models/admin.model.js";
// import jwt from "jsonwebtoken";

// const authAdmin = asyncHandler(async(req,_,next) =>{

//     const accToken = req.cookies?.Accesstoken

//     if(!accToken) {
//         throw new ApiError(401, "unauthorized req")
//     }


//     const decodedAccToken = jwt.verify(accToken,
//         process.env.ACCESS_TOKEN_SECRET)

//     const Admin = await admin.findById(decodedAccToken?._id).select("-password -Refreshtoken")

//     if(!Admin){
//         throw new ApiError(401, "invalid access token")
//     }

//     req.Admin = Admin
//     next()

    
// })

// export { authAdmin }

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken";

const authAdmin = asyncHandler(async (req, _, next) => {
    const accToken = req.cookies?.Accesstoken;

    // If token not found
    if (!accToken) {
        throw new ApiError(401, "Unauthorized request: No access token found");
    }

    let decoded;
    try {
        decoded = jwt.verify(accToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token");
    }

    // Find admin
    const Admin = await admin
        .findById(decoded?._id)
        .select("-Password -Refreshtoken");

    if (!Admin) {
        throw new ApiError(401, "Admin not found or token invalid");
    }

    // Attach admin to request
    req.admin = Admin;

    next();
});

export { authAdmin };
