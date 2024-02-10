import { Router  } from "express";
import { registerUser } from "../controllers/user.controllers.js";

const router = Router();

router.route("/register").post((req,res) => {
  res.status(200).json({
    messege : "My code is running"
  })
})

export default router