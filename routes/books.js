import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router() ; 
const prisma = new PrismaClient() ;

router.get('/books' , async (req , res) => {
   // for fetching top three books 
  try {

   const userId = req.user.userId;
   if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }
   const user = await prisma.user.findUnique({
       where: { id: userId },
         include  : {
            book : {
               where :  {status : "read"} ,
               take : 3 ,
            }
         }
     }) ;

     if(!user) {
        return res.status(404).json({error :  "User does not exits"}) ;
     }

      
     if(user.book.length == 0 ) {
        return res.status(200).json({message : "No books read yet"});
     }
     return res.status(200).json({books : user.book}) ;

    
    } catch(e) {
        console.log(e) ;
        return res.status(500).json({error : "Internal server error "} ) ;
    }    

} )

router.post("/api/add-book" ,async(req , res )=>{

 console.log(req.body);
 console.log(req.user);
   
  const {title , author , status , cover_url , start_date , end_date , rating , review , date_added} = req.body ;
  const userId = req.user.userId ;

  if(!userId) {
   return res.status(400).json({ error: "Unauthorized access" });
}
const authorString = Array.isArray(author) ? author.join(', ') : author ;

try {

   let book = await prisma.books.findFirst({
      where : {
         userId : {
            has : userId , 
         } ,      
         title : title , 
         author : authorString, 
      }  , 
   })
   
   if(book) {
      return res.status(400).json({message : "book already exists for user"});
   }
   
   const newBook = await prisma.books.create({
      data  : {
         title : title , 
         author : authorString, 
         status : status , 
         cover_url : cover_url  , 
         start_date : new Date(start_date) , 
         end_date : new Date(end_date), 
         rating : rating , 
         review :review ,
         date_added : date_added , 
         userId : [userId] , 
   
      }
    
   })

   await prisma.user.update({
      where: { id: userId },
      data: {
        bookId: {
          push: newBook.id, 
        },
      },
    });
   
   return res.status(200).json({newBook});

}catch (error) {
   console.error("Error creating book:", error);
   return res.status(500).json({ error: "Internal server error" });
 }
});
   

router.delete("/api/remove-book" ,async(req , res)=>{

   console.log(req.body);

   try  {
   const {title , author} = req.body ;
   const user = req.user ; 
   const userId = user.userId ; 
 
   if (!user) {
      return res.status(400).json({ error: "Unauthorized access" });
    }
const authorString = Array.isArray(author) ? author.join(', ') : author ;

   let book  = await prisma.books.findFirst({
      where : {
          userId : {
            has:userId
          },
          title : title , 
          author : authorString ,  
      } , 
   }) ;

   if(!book) {
      return res.status(404).json({error : "Book not found"}) ;
   }
   await prisma.user.update({
      where: { id: userId },
      data: {
        bookId: {
          set: (await prisma.user.findUnique({ where: { id: userId } })).bookId.filter(id => id !== book.id),
        },
      },
    });

   await prisma.books.delete({
       where : {id : book.id} , 
   });

   return res.json({message : "book deleted successflly"}) ;
} catch(e) {
   console.error(e) ;
   return res.status(500).json({error :"Internal server error"});
}  
}) 

 
router.get("/api/books/read" , async(req , res)=>{

   try {
      const user = req.user ;
      if(!user) {
         return res.status(400).json({error: "Unauthorised access"}) ;

      }

      const books =await prisma.books.findMany({
         where : {
            userId : {
               has : user.userId
            }, 
            status  : "read",
         }
      }) ;

      if(!books) {
         return res.status(200).json({message : "No books read yet"});
      }
      return res.status(200).json({books});
   }catch(error) {
      console.error(error) ;
      return res.status(500).json({error : "Internal server error"}) ;
   }
})

router.get("/api/books/toread" , async(req , res) => {
   try {
      const user = req.user ;

      if(!user) {
         return res.status(400).json({ error: "Unauthorized access" });

      }

      const books = await prisma.books.findMany({
         where : {
            userId :{
               has :  user.userId , 
            },
            status : "to_read" ,   
         }
      }) ;
      if (!books) {
         return res.status(200).json({ message: "No books in To-Read list" });
       }
   
       return res.status(200).json({books});
   
     } catch (error) {
       console.error(error);
       return res.status(500).json({ error: "Internal server error" });
     }
   });

   export default router;