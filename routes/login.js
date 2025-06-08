
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt' ;
import dotenv from 'dotenv' ;
import jwt from 'jsonwebtoken' ;


dotenv.config() ;
    
const router = Router() ; 
const prisma = new PrismaClient();
const secret = process.env.TOKEN_SECRET ; 
const refreshSecret = process.env.REFRESH_SECRET ; 

    router.post('/login' , async(req , res)=>{
        const {email , password } = req.body ;
     
         try {
            if(!email || !password) {
                return res.status(400).json({message : "one or more details are missing"});
            }
           const userExists = await prisma.user.findUnique({
            where : {email}
           }) ; 

          if(userExists){
            const comparePassword  = await bcrypt.compare(password , userExists.password);
               if(!comparePassword) {
                  return res.status(401).json({message : "password provided is wrong"}) ;
               }
               const { id, name, email } = userExists;
               const accessToken = jwt.sign({userId : userExists.id }, secret ,  {expiresIn:'1h'}) ;
               const refreshToken = jwt.sign({userId : userExists.id} , refreshSecret , {expiresIn : '7d'}) ;
             // refresh token only in cookie 
               res.cookie('refreshToken' , refreshToken , {
                  httpOnly : true , 
                  secure : true , 
                  sameSite : 'Strict' , 
                  maxAge : 7 * 24 * 60 * 60 * 1000  // 7 days
               })
               // access token in response
               res.status(200).json({token :accessToken, user: { id, name, email }});
          } else {
            return res.status(401).json({message : "Authenticaation failed ."});
          } 
  
     } catch(e) {
            console.log(e) ;
            res.status(500).send({message : "Internal Server error"}) ;
         }

    }) ;

    
export default router; 

