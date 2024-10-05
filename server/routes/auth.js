const router = require('express').Router();
const User = require ('../models/User');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:8000/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done)=>{
        try{

            let user = await User.findOne({email: profile.emails[0].value})
            if(user){
                if(user.authMethod !== 'google'){
                    return done(null, false, {message: "You have previously signed up with a different method"})
                }
            }
            else{
                user = new User({
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value,
                    authMethod: 'google',
                    password: null
                });
                await user.save();
            }

            done(null, user);
        }
        catch(err){
            done(err, false);
        }
    }
));

passport.serializeUser((user, done)=>{
    done(null, user.id)
})

passport.deserializeUser(async (id, done)=>{
    try{
        const user = await User.findById(id);
        done(null, user);
    }
    catch(err){
        done(err, false);
    }
})

router.post('/signUp', async(req, res)=>{
    try{
        const {firstName, lastName, email, password} = req.body;
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: "User already exists with this email"});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            firstName,
            lastName,
            email, 
            password: hashedPassword,
            authMethod: 'local'
        });
        await user.save();
        res.status(200).json({message: "User Sign-Up successfull"}); 
    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.post('/signIn', async(req, res)=>{
    try{
        const {email, password} = req.body;
        let user = await User.findOne({email});
        if(!user){ return res.status(400).json({message: "User doesn't exist"}); }

        if(user.authMethod !== 'local'){
            return res.status(400).json({ message: `Please sign in using ${user.authMethod}` });
        }

        // Check password 
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){ return res.status(400).json({message: "Invalid credentials"}); }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
        res.status(200).json({authToken: token});
    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
})

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', 
    passport.authenticate('google', {failureRedirect: 'http://localhost:3000/auth'}),
    (req, res) =>{
        const token = jwt.sign({id: req.user._id}, process.env.JWT_SECRET);
        res.redirect(`http://localhost:3000/auth?token=${token}`)
    }
)

module.exports = router;