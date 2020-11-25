const jwt = require('jsonwebtoken')
const config = require('config')

const auth = (req, res, next) =>{
    //check for token in  header, header is meant to be set in the application while making requests
    const token = req.header('x-auth-token')
    if(!token){
        return res.status(400).send('No authorization token sent');
    }
     //let's verify the sent token
     const secret = config.get('jwtSecret')
     try {
        const decoded = jwt.verify(token, secret)
        req.user = decoded.user;
        next();
     } catch (error) {
         console.log("token error", error)
         return res.status(401).json({errors: [{msg: "Unauthorized token"}]})
     }
     
}

module.exports = auth;