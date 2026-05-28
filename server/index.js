require('dotenv').config();
const express = require('express'); //express framework
const cors = require('cors'); //cors to allow frontend to talk to backend
const helmet = require('helmet'); //adds security headers to every response
const cookieParser = require('cookie-parser'); //allows reading cookies from incomming requests
const morgan = require('morgan');

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


//Routers
 const authRouter = require('./routes/auth.js');

 //Routing
 app.use('/auth', authRouter); 


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));