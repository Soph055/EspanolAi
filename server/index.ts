import 'dotenv/config';
import express from 'express'; //express framework
import cors from 'cors'; //cors to allow frontend to talk to backend
import helmet from 'helmet'; //adds security headers to every response
import cookieParser from 'cookie-parser'; //allows reading cookies from incomming requests
import morgan from 'morgan';
//Routers
import authRouter from './routes/auth';
import chatRouter from './routes/chat';
const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); //tells express to trust first proxy infront of it

//middleware

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true })); // tells express which frontend URL is allowed to make requests // credentials: true is required so cookies get sent with requests
app.use(helmet({ contentSecurityPolicy: false }));// contentSecurityPolicy is turned off because it breaks things in development
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));





 //Routing
 app.use('/auth', authRouter);
 app.use('/chat', chatRouter);



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));