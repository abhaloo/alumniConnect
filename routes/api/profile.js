const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route GET api/profile/me
//@desc Test route 
//@access Private 
router.get('/me', auth, async (req,res) => {
    try {
        //populate() brings in data from the user schema, specified in the array provided as the second argument 
        const profile = await Profile.findOne({ user: req.user.id}).populate('user',['name','avatar']);
        
        //check if profile exists
        if(!profile){
            return res.status(400).json({ msg: 'There is no profile for this user'});
        }

        res.json(profle);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error - Profile')
    }
});

module.exports = router;