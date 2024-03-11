import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import cors from "cors";
import router from "./Routes/AuthRoutes.js";
import cookieParser from "cookie-parser";

const app = express();
const port = 4000;
env.config();

app.use(cors({
    origin: [process.env.APP_URL],
    methods: ["GET","POST","PUT","DELETE","PATCH"],
    credentials: true,
}));

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());
app.use("/",router);




app.listen(port,()=> {
    console.log(`Listen at port: ${port}`);
}); 


