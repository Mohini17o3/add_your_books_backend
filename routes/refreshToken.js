import { Router } from "express";
import dotenv from 'dotenv' ;
import jwt from 'jsonwebtoken' ;
import { PrismaClient } from "@prisma/client";
dotenv.config() ;

const router = new Router() ; 
const prisma = new PrismaClient() ; 
const secret = process.env.TOKEN_SECRET ; 
const refreshSecret = process.env.REFRESH_SECRET ; 


router.post('/' , async (req , res) => {
const token =  req.cookies.refreshToken ;
if(!token) {
    return res.status(401).json({message : "No token found"}) ;
}
try {
    const payload = jwt.verify(token ,refreshSecret);
    const accessToken = jwt.sign({userId : payload.userId} ,secret ,{expiresIn : '1h'}  );
    const user = await prisma.user.findUnique({
        where : {id : payload.userId} , 
        select : {id : true , name : true , email : true} , 
    }) ;

    if(!user) {
        return res.status(404).json({message : "user not found"}) ;
    }
    res.json({token : accessToken}) ; 
} catch(e) {
     console.log(e) ;
    return res.status(403).json({message : 'invalid refresh token'}) ; 
}
})

export default router ;