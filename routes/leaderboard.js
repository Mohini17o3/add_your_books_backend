import { PrismaClient } from "@prisma/client";
import { Router } from "express"; 

const router = Router() ; 
const prisma  = new PrismaClient() ;


router.get('/leaderboard'  , async(req , res) => {
 
     try{
         const users =  await prisma.user.findMany({
             include : {
                book : true ,  
             }   
         }) ;

         
         const leaderboard =  users.map((user)=> ({
            userId: user.id,
            userName : user.name , 
            readCount : user.book.filter(book => book.status=== "read").length
         })) ;  

         leaderboard.sort((a , b )=> b.readCount - a.readCount);

         const ranks =  leaderboard.map((entry , index) => ({
            ...entry ,
            rank : index + 1 , 
         }))

         res.json(ranks) ;
     } catch(e) {
        console.log(e) ; 
        res.status(500).send({message : "Internal server error"}) ; 
     }

})


export default router ; 