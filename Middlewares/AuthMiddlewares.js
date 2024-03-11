import jwt from "jsonwebtoken";
import { dbUtility } from "../DatabaseUtilities/pgUtilities.js";
import env from "dotenv";

// env.config();

function checkUser(req,res,next) {
    const token = req.cookies.jwt;
    if(token) {
        jwt.verify(token,process.env.JWT_SECRET_KEY,async(err,decodedToken)=>{
            if (err) {
                res.json({loginStatus: false});
                next();
            } else {
                // send user information to frontend
                const user = await dbUtility.checkUserById(decodedToken.id);
                if(user) res.json({loginStatus:true, user:user.rows[0].username});
                else res.json({loginStatus: false});
                next();
            }
        })
    } else {
        res.json({loginStatus: false});
        next();
    }
}

export default checkUser;