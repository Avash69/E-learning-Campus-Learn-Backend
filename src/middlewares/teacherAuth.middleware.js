// import { ApiError } from "../utils/ApiError.js";
// import {Teacher} from "../models/teacher.model.js";
// import jwt from "jsonwebtoken";
// import { asyncHandler } from "../utils/asyncHandler.js";

// const authTeacher = asyncHandler(async(req,_,next)=>{
//     const accToken = req.cookies?.Accesstoken

//     if(!accToken){
//         throw new ApiError(401, "unauthorized req")
//     }

//     const decodedAccToken = jwt.verify(accToken,
//         process.env.ACCESS_TOKEN_SECRET)

//     const teacher = await Teacher.findById(decodedAccToken?._id).select("-Password -Refreshtoken")

//     if(!teacher){
//         throw new ApiError(401, "invalid access token")
//     }


//     req.teacher = teacher
//     next()
// })

// export {authTeacher}

import { ApiError } from "../utils/ApiError.js";
import { Teacher } from "../models/teacher.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

const authTeacher = asyncHandler(async (req, _, next) => {
    try {
        const accToken = req.cookies?.Accesstoken;

        if (!accToken) {
            throw new ApiError(401, "Unauthorized request: No access token provided");
        }

        let decodedAccToken;
        try {
            decodedAccToken = jwt.verify(accToken, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            throw new ApiError(401, "Invalid or expired access token");
        }

        const teacherDoc = await Teacher.findById(decodedAccToken?._id).select("-Password -Refreshtoken");

        if (!teacherDoc) {
            throw new ApiError(401, "Teacher not found");
        }

        req.teacher = teacherDoc;
        next();
    } catch (err) {
        next(err); // pass error to global error handler
    }
});

export { authTeacher };
