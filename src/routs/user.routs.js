import { Router  } from "express";

import {upload} from "../middleware/multer.middleware.js"
import { logOutUser,
         loginUser, 
         registerUser,
         refreshAccessToken,
         changeCurrentPassword,
         getCurrentUser,
         updateAcountDetails, 
         updateUserAvatar, 
         updateUserCoverImage, 
         getUserChannelProfile, 
         getWatchHistory } 
   from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([{
     name : "avatar",
     maxCount : 1
  },
  {
    name : "coverImage",
    maxCount : 1
  }
]),
  registerUser) 

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT , logOutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post( verifyJWT , changeCurrentPassword)

router.route("/current-user").get(verifyJWT , getCurrentUser)

router.route("upgrade-account-details").patch(verifyJWT , updateAcountDetails)

router.route("/update-avatar").patch(verifyJWT , upload.single("avatar") , updateUserAvatar)

router.route("/update-coverImage").patch(verifyJWT , upload.single("coverImage") , updateUserCoverImage)

router.route("/c/:username").get(verifyJWT , getUserChannelProfile)

router.route("/watchHistory").get(verifyJWT , getWatchHistory)

export default router