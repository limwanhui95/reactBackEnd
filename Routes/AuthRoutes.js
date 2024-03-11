import express from "express";
import { register,login,addPost,allNote,deleteNote } from "../Controllers/AuthControllers.js";
import checkUser from "../Middlewares/AuthMiddlewares.js";

const router = express.Router();


router.post("/",checkUser);
router.post("/register",register);
router.post("/login",login);
router.post("/addPost",addPost);

// router.get("/",checkUser);
router.get("/allNote",allNote);


router.delete("/delete/:noteId",deleteNote);

export default router;