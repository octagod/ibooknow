// IMPORTS
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require("cors")
const path = require("path")

const authRoute = require('./auth/auth');
const user = require('./auth/user');
const authDashboard = require('./auth/authDashboard');
const queryDB = require('./auth/queryDB');
const widgetQuery = require('./auth/widgetQuery');



const PORT = process.env.PORT || 9000;

// INITIALISE EXPRESS
const app = express();

// INITIALISE DOTENV
dotenv.config();

app.use(cors());

//MIDDLEWARE
app.use(express.urlencoded({extended: false}));
// app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('frontend/build'));
app.use(cookieParser());
app.use((req,res,next)=> {
    let allowedOrigins = ['http://localhost:3000', 'http://localhost:5500', 'https://widget.ibooknow.digital', 'https://dashboard.ibooknow.digital'];
    let origin = req.headers.origin;
    if(allowedOrigins.includes(origin)){
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials','true');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
});



//ROUTES

app.use(authRoute);

app.use(authDashboard);

app.use(user);

app.use(queryDB);

app.use(widgetQuery);

// handle all routes not found in servers
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend/build", "index.html"))
})

app.listen(PORT, () => console.log('listening to port:'+PORT));