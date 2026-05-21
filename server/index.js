require('dotenv').config();
//express framework
const express = require('express');
//cors to allow frontend to talk to backend
const cors = require('cors');
//adds security headers to every response
const helmet = require('helmet');
//allows reading cookies from incomming requests
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

//tells express to trust first proxy infront of it
app.set('trust proxy', 1);

//middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// tells express which frontend URL is allowed to make requests
// credentials: true is required so cookies get sent with requests
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
// applies helmet security headers but turns off contentSecurityPolicy
// contentSecurityPolicy is turned off because it breaks things in development
app.use(helmet({ contentSecurityPolicy: false }));


//Routers
 const authRouter = require('./routes/auth.js');

 //Routing
 app.use('/auth', authRouter); 


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));