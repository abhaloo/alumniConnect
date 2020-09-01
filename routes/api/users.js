const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');


//@route POST api/users
//@desc Register user 
//@access Public  
router.post('/',
    [ check('name','Name is required').not().isEmpty(),
      check('email','Please include a valid email').isEmail(),
      check('password','Please enter a password with 6 or more characters').isLength({ min: 6})
    ],
    
    async (req,res) => {
    console.log(req.body);
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;
    
    try {
    
    //See if user exists 
    let user = await User.findOne({ email });

    if(user) {
        //400 - Bad request
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }
    

    // get users gravatar or provide a default if they don't have one  
    const avatar = gravatar.url(email, {
        s: '200', //size
        r: 'pg', //rating
        d: 'mm' //default image
    })

    //create user 
    user = new User({
        name,
        email,
        avatar,
        password
    })

    // Encrypt user password
    const salt = await bcrypt.genSalt(10);
    user.password == await bcrypt.hash(password, salt);

    //save() returns a promise, thus we use await
    await user.save()

    // Return jsonwebtoken 
    
    res.send('User has been registered');

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
        
    }

    res.send('User route')
});

module.exports = router;