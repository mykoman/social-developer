const express = require('express')
const auth = require('../../middleware/auth')
const router = express.Router()
const User = require('../../Models/User')
const bycrpt = require('bcryptjs');
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')


router.post('/', [
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Please provide a password').exists()
], async (req, res) =>{

    const validation  = validationResult(req)
    if(!validation.isEmpty()) return res.status(400).json({errors: validation.array()})
    console.log(1)
    const {password, email} = req.body 
    
    
    try {
        const user = await User.findOne({email}) //findById(userId).select("-password")
        if(!user) return res.status(400).json({errors : [{msg: "Invalid credentials"}]})

        const encryptedPassword = user.password
    const isMatch = await bycrpt.compare(password, encryptedPassword)
    if(!isMatch) return res.status(400).json({errors : [{msg: "Invalid credentials"}]})
        //res.status(200).json(user);
        //sign token via jwt
        const payload = {
            user : user.id
        }

        jwt.sign(payload, config.get("jwtSecret"), { expiresIn: config.get("tokenExpiry") }, (err,token) =>{
            if(err) throw err
            res.status(200).json({token})
        } )


    } catch (err) {
        console.log(err)
        return res.status(500).send("Server error")
    }
    
})

module.exports = router;