// import {v2 as cloudinary} from 'cloudinary';
// import fs from "fs"



// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_SECRET_KEY 
// });


// const uploadOnCloudinary = async (localFilePath) => {
    
//     try{
//         if(!localFilePath) return null;
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         })
//         fs.unlinkSync(localFilePath)
//         return response;
//     } catch(err){
//         fs.unlinkSync(localFilePath)
//         console.log("cloudinary upload error ", err)
//         return null;
//     }
// }


// export {uploadOnCloudinary}


import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath, folder = "") => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folder, // optional folder in Cloudinary
    });
    return response;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return null;
  } finally {
    // Safely delete local file if it exists
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
};

export { uploadOnCloudinary };
