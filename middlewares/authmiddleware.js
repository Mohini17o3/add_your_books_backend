import jwt from  'jsonwebtoken' ;

const authmiddleware = (req , res , next) =>{
     
    const token = req.headers.authorization?.split(" ")[1] ;

    if(!token) {
        return res.status(401).json({message :"unauthorised access , no token "}) ;
    }
     
    try {
        const decoded = jwt.verify(token , process.env.TOKEN_SECRET) ; 
        req.user = decoded ; 
        next() ;
    } catch(e) {
        console.log(e) ; 
        res.status(500).json({message : "Invalid token"}) ;
    }
     

}


export default authmiddleware ; 