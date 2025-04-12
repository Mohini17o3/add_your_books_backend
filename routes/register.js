import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt' ;

const router = Router() ; 
const prisma = new PrismaClient();
    router.post('/register' , async(req , res)=>{
        const {name, email , password } = req.body ;
      

         try {
            if(!name || !email || !password) {
                return res.status(400).json({message : "one or more details are missing"});
            }

            const existingUser  = await prisma.user.findUnique({
                where : {email}
            }) ;

            if(existingUser) {
                return res.status(400).json({message : "This email is already registered"});
            }

            const hashedPassword = await bcrypt.hash(password , 10) ;
            const user = await prisma.user.create({
                data : {
                    name , 
                    email , 
                    password : hashedPassword ,
                }
            }) ;

            return res.status(200).json({message : "user registered successfully"}) ;


         } catch(e) {
            console.log(e) ;
            res.status(500).send({message : "Internal Server error"}) ;
         }

    })


export default router; 

