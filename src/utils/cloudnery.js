import {v2 as cloudinary} from "cloudinary";
import fs from "fs" 
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECREAT 
});


const uploadOnCloudibary = async (localFilePath) => {
  try {

    if(!localFilePath) return null

    const response =await cloudinary.uploader.upload(localFilePath,{
      resource_type : "auto"
    })

    fs.unlinkSync(localFilePath);

    return response;
    
  } catch (error) {
      fs.unlinkSync(localFilePath);
      return null
  }
}

const deleteFromCloudinary = async (oldUrl) => {
  try {

    if(!oldUrl) return null

    const response = await cloudinary.uploader.destroy(oldUrl,{
      resource_type : "auto"
    })

    return response;
}
catch (error) {
  return null
}
}

export {uploadOnCloudibary  , deleteFromCloudinary}