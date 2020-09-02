/* Used to verify the JSON web token that comes from the client
/* and authenticate users  */
const jsonwebtoken = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    //get token from header
    const token = req.header('x-auth-token');

    //check if not token 
    if(!token){
        return res.status(401).json({ msg: 'No token, authorization denied'});
    }

    //verify token 
    try{
        const decoded = jsonwebtoken.verify(token,config.get('jwtToken'));
    
        req.user = decoded.user;
        next(); //pass session to next middleware
    } catch (err){
        res.status(401).json({ msg: 'Token is not valid'});
    }
}