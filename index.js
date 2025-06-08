import express from 'express' ;
import bodyParser from 'body-parser';
import register from  './routes/register.js'
import login from  './routes/login.js' ;
import bookRoutes from  './routes/books.js' ;
import leaderboardRoutes from './routes/leaderboard.js' ; 
import authmiddleware from "./middlewares/authmiddleware.js" ; 
import refreshTokenRoutes from "./routes/refreshToken.js"
import cors from  'cors' ;
import cookieParser from 'cookie-parser';


const app = express () ;

app.use(cors({
    credentials: true, origin :[ "http://localhost:5173" , "https://add-your-books.vercel.app"]}) );
app.use(bodyParser.json());
app.use(cookieParser()) ;

app.post('/register', register) ;
app.post('/login', login) ;
app.get('/books', authmiddleware ,bookRoutes) ; 
app.post('/api/add-book', authmiddleware ,bookRoutes) ; 
app.delete('/api/remove-book', authmiddleware ,bookRoutes) ; 
app.get('/api/books/read', authmiddleware ,bookRoutes) ; 
app.get('/api/books/toread', authmiddleware ,bookRoutes) ; 
app.get('/leaderboard', authmiddleware ,leaderboardRoutes) ; 
app.post('/refresh-token',refreshTokenRoutes) ; 


app.listen(8000 , ()=>{
     console.log("server running on port 8000") ;
})
 