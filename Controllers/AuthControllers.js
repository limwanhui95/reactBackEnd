import env from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {dbUtility} from "../DatabaseUtilities/pgUtilities.js";

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
                    res.cookie("jwt",token,{ withCredentials: true,httpOnly: false,maxAge: maxAge*1000});
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
                    res.cookie("jwt",token,{ withCredentials: true,httpOnly: false,maxAge: maxAge*1000});
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

async function addPost(req,res,next) {
    const {title, content, userid } = req.body;
    try {
        const insertResult = await dbUtility.insertNewNote(userid,title,content);
        console.log(insertResult);
        res.status(200).json({noteid:insertResult.rows[0].noteid});
    } catch (err) {
        console.log(err);
        res.status(503).json({error:"Error when try to insert new note"});
    }
}

async function allNote(req,res,next) {
    const userId = parseInt(req.query.userId);
    // console.log(userId);
    if (userId) {
        try {
            const fetchNoteResult = await dbUtility.fetchUserNotes(userId);
            res.status(200).json(fetchNoteResult.rows);
        } catch (err) {
            console.log(err);
            res.status(503).json({error:"Error when getting user note!"});
        }
    }  
}

async function deleteNote(req,res,next) {
    const noteId = parseInt(req.params.noteId);
    console.log(noteId);
    try {
        const deleteResult = await dbUtility.deleteUserNotes(noteId);
        res.status(200).json({result:deleteResult});
    } catch (err) {
        res.status(503).json({error:"Error when deleting note!"});
    }
}


const _register = register;
export { _register as register };
const _login = login;
export { _login as login };
const _addPost = addPost;
export {_addPost as addPost};
const _allNote = allNote;
export { _allNote as allNote };
const _deleteNote = deleteNote;
export { _deleteNote as deleteNote };