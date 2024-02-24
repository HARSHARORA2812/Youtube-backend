import { Router  } from "express";

import {upload} from "../middleware/multer.middleware.js"
import { logOutUser, loginUser, registerUser ,refreshAccessToken } from "../controllers/user.controllers.js";
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

export default router