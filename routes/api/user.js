const express = require('express')
const {check, validationResult} = require('express-validator')
const router = express.Router();
const User = require('../../Models/User')
const bcrypt = require('bcryptjs')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const config = require('config')



router.post('/register', [
    //implement validations
    check('name', 'Name is required').not().isEmpty(),
    check('password', 'Password must have a minimum length of six(6) characters').isLength({min:6}),
    check('email', 'Email is invalid').isEmail()
], async (req, res) => {
    const validation = validationResult(req)
    const {name, email, password} = req.body;
    if(!validation.isEmpty()){
        res.status(400).json({errors : validation.array()})
    }
    //configure gravatar
    const avatar = gravatar.url(email, {
        s: "200", //size
        r: 'pg', //rating set to parental guidance
        d: 'mm' //default
    })

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(password, salt);

    try {
        //check if user already exists
        let user = await User.findOne({email})
        if(user){
            //user exists
            return res.status(400).json({errors: [{msg: "User already exists"}]})
        }
        
      user = new User({
            name,
            email,
            avatar,
            password: hashedPwd,
            updatedAt: Date.now()
        }) 

        await user.save();

        //let's create payload for jwt signing
        const payload = {
            user: user.id //mongoose would have made available the id from the _id of the object 
        }
        const jwtSecret = config.get('jwtSecret')
        const tokenExpiry = config.get('tokenExpiry')
        jwt.sign(payload, jwtSecret, {expiresIn: tokenExpiry}, (err, token) =>{
            if(err) throw err
            return res.status(200).json({token})
        } )
        //res.status(200).json(user);

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }
    
    //res.status(200).json(req.body);
})

module.exports = router;