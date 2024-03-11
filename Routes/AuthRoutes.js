import express from "express";
import { register,login } from "../Controllers/AuthControllers.js";
import checkUser from "../Middlewares/AuthMiddlewares.js";

const router = express.Router();


router.post("/",checkUser);
router.post("/register",register);
router.post("/login",login);

export default router;