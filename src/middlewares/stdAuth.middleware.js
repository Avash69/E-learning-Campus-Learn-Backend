// import {asyncHandler} from "../utils/asyncHandler.js";
// import {ApiError} from "../utils/ApiError.js";
// import {student} from "../models/student.model.js";
// import jwt from "jsonwebtoken";

// const authSTD = asyncHandler(async(req,_,next) =>{

//     const accToken = req.cookies?.Accesstoken

//     if(!accToken) {
//         throw new ApiError(401, "unauthorized req")
//     }

//     const decodedAccToken = jwt.verify(accToken,
//         process.env.ACCESS_TOKEN_SECRET)

//     const Student = await student.findById(decodedAccToken?._id).select("-Password -Refreshtoken")

//     if(!Student){
//         throw new ApiError(401, "invalid access token")
//     }

//     req.Student = Student
//     next()

    
// })

// export { authSTD }

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { student } from "../models/student.model.js";
import jwt from "jsonwebtoken";

const authSTD = asyncHandler(async (req, _, next) => {
    try {
        const accToken = req.cookies?.Accesstoken;

        if (!accToken) {
            throw new ApiError(401, "Unauthorized request: No access token");
        }

        let decodedAccToken;
        try {
            decodedAccToken = jwt.verify(accToken, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            throw new ApiError(401, "Invalid or expired access token");
        }

        const studentDoc = await student
            .findById(decodedAccToken?._id)
            .select("-Password -Refreshtoken");

        if (!studentDoc) {
            throw new ApiError(401, "Student not found");
        }

        req.Student = studentDoc;
        next();
    } catch (err) {
        // Propagate the error to the global error handler
        next(err);
    }
});

export { authSTD };
