const express = require('express');
const { check, validationResult } = require('express-validator');

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

//@route POST api/profile
//@desc Create or update user profile 
//@access Private 
router.post('/', [  auth, 
    [ 
        check('status','Status is required').not().isEmpty(),
        check('skills', 'Skills are required').not().isEmpty()
    ]], 
    async (req,res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() })
        }

        const { 
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            linkedin,
            instagram
        } = req.body; 

        //Build profile object 
        const profileFields = {};
        profileFields.user = req.user.id;

        if (company) {profileFields.company = company;}
        if (website) {profileFields.website = website;}
        if (location) {profileFields.location = location;}
        if (bio) {profileFields.bio = bio;}
        if (status) {profileFields.status = status;}
        if (githubusername) {profileFields.githubusername = githubusername;}
        //convert skills from comma-seperated values to array
        if(skills) {
            profileFields.skills = skills.split(',').map( skill => skill.trim());
        }

        //console.log(profileFields.skills);

        //Build object for social links
        profileFields.social = {};
        if (youtube) {profileFields.social.youtube = youtube;}
        if (twitter) {profileFields.social.twitter = twitter;}
        if (facebook) {profileFields.social.facebook = facebook;}
        if (linkedin) {profileFields.social.linkedin = linkedin;}
        if (instagram) {profileFields.social.instagram = instagram;}

        try {
            
            let profile = await Profile.findOne({ user: req.user.id });

            if(profile) {
                //update profile if it exists
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id }, 
                    { $set: profileFields },
                    { new: true} );
                    return res.json(profile);
            }

            //Create Profile
            profile = new Profile(profileFields);

            await profile.save();
            res.json(profile);

        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server Error - Api/Profile')
        }


    })


module.exports = router;