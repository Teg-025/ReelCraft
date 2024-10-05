const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const { default: mongoose } = require('mongoose');

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.static('public'));
app.use('/downloads', express.static(path.resolve(__dirname, 'downloads')));
app.use(express.json());
app.use(cors());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const createReelRoute = require('./routes/createReel')
app.use('/createReel', createReelRoute);

mongoose.connect(process.env.MONGO_URI, {dbName: "ReelCraft"})
    .then(()=>{
        app.listen(port, ()=>{
            console.log("Server running at "+port);
        })
    })
    .catch((err)=>{
        console.log(err);
    })