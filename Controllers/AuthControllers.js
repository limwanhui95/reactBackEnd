import env from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {dbUtility} from "../DatabaseUtilities/pgUtilities.js"
env.config();

const maxAge = 24*60*60; // one day
const createToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET_KEY,{
        expiresIn: maxAge,
    });
}

async function register(req,res,next) {
    const { username,password } = req.body;
    try {
        const checkResult = await dbUtility.checkUserByUsername(username);
        if (checkResult.rows.length >0) {
            res.json({error: "Username already exists. Try another username.", loginStatus:false});
        } else {
            bcrypt.hash(password,5,async(error,hash)=>{
                if(error) {
                    console.log(error);
                    res.status(409).json({error: "Hash error!", loginStatus:false});
                } else {
                    // insert new user to database
                    const result = await dbUtility.insertNewUser(username,hash);
                    const token = createToken(result.rows[0].id);
                    // send cookie
                    res.cookie("jwt",token,{ withCredentials: true,httpOnly: false,maxAge: maxAge*1000, sameSite:"None"});
                    res.status(201).json({user:result.rows[0].id, loginStatus:true});
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(409).json({error: "Error when connecting/inserting data to database"});
    }  
};

async function login(req,res,next) {
    const { username,password } = req.body;
    try {
        const checkResult = await dbUtility.checkUserByUsername(username);
        if (checkResult.rows.length > 0) {
            // user exist
            const user = checkResult.rows[0];
            const storedHashedPassword = user.password;
            bcrypt.compare(password,storedHashedPassword,(err,result)=>{
                if(err) {
                    res.status(503).json({error: "Bcrypt error!"});
                } else if (result) {
                    // send cookie
                    const token = createToken(user.id);
                    res.cookie("jwt",token,{ withCredentials: true,httpOnly: false,maxAge: maxAge*1000, sameSite:"None"});
                    res.status(200).json({user:user.id, loginStatus:true});
                } else  {
                    // password do not match
                    res.status(400).json({error: "Wrong password!"});
                }
            });
        } else {
            // user doesn't exist
            res.status(400).json({error: "Username doesn't exist!"});
        }
    } catch (err) {
        console.log(err);
        res.status(503).json({error:"Error when try check result from database"});
    }
};

const _register = register;
export { _register as register };
const _login = login;
export { _login as login };