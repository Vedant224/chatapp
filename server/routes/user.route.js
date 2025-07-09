import express from "express"
import { checkAuth, updateProfile } from "../controllers/user.controller";
import { protectRoute } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile",protectRoute, updateProfile);
userRouter.get("/check",protectRoute, checkAuth);

export default userRouter;