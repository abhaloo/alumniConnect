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

        res.json(profile);

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


    });

//@route GET api/profile/
//@desc Get all profiles 
//@access Public 

router.get('/', async (req,res) => {
    try {
        
        const profiles = await Profile.find().populate('user',['name','avatar']);
        
        res.json(profiles);

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error when getting all user profiles')
    }
});

//@route GET api/profile/user/:user_id
//@desc Get user profile by user ID 
//@access Public 

router.get('/user/:user_id', async (req,res) => {
    try {
        
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user',['name','avatar']);

        if(!profile){
            return res.status(400).json({ msg: 'There is no profile for this user'});
        }
        
        res.json(profile);

    } catch (error) {
        console.log(error.message);

        if(error.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Profile Not Found'});
        }
        res.status(500).send('Server error when getting profiles using user ID')
    }
});


//@route DELETE api/profile/user/:user_id
//@desc Delete user profile  
//@access Public 

router.delete('/', auth,  async (req,res) => {
    try {
        
        //@todo remove user posts

        //remove user profile
        await Profile.findOneAndRemove({ user: req.user.id }).populate('user',['name','avatar']);
        
        //remove user 
        await Profile.findByIdAndRemove({_id: req.user.id});

        res.json({msg: 'User removed'});

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error when getting all user profiles')
    }
});

//@route PUT api/profile/experience
//@desc Add profile Experience  
//@access Privte
router.put('/experience', [auth, [check('title','Title is required').not().isEmpty(),
                        check('company','Company is required').not().isEmpty(),
                        check('from','From date is required').not().isEmpty()            
        ] 
    ],
    
    async (req,res) => {
       const errors = validationResult(req);
       if(!errors.isEmpty()){
           return res.status(400).json({ errors: errors.array() });
       }

       const { 
        company,
        title,
        location,
        from,
        to,
        current,
        description
    } = req.body; 

        const newExperience = {
            company,
            title,
            location,
            from,
            to,
            current,
            description

        };


        try {
            
            const profile = await Profile.findOne({ user: req.user.id });

            profile.experience.unshift(newExperience);

            await profile.save();

            res.json(profile);

        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server error when adding profile experience');
        }

    }
); 

//@route DELETE api/profile/experience/:exp_id
//@desc delete profile experience  
//@access Privte
router.delete('/experience/:exp_id', auth ,async (req,res) => {
    
        try {
            
            const profile = await Profile.findOne({ user: req.user.id });

            
            //get remove index 
            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

            profile.experience.splice(removeIndex , 1);


            await profile.save();

            res.json(profile);

        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server error when deleting profile experience');
        }

    }
); 

//@route PUT api/profile/education
//@desc Add profile education  
//@access Privte
router.put('/education', [auth, [check('school','Title is required').not().isEmpty(),
                        check('degree','Degree is required').not().isEmpty(),
                        check('fieldofstudy','Field of Study is required').not().isEmpty(),
                        check('from','From date is required').not().isEmpty()            
        ] 
    ],
    
    async (req,res) => {
       const errors = validationResult(req);
       if(!errors.isEmpty()){
           return res.status(400).json({ errors: errors.array() });
       }

       const { 
        school,
        degree,
        fieldofstudy,
        location,
        from,
        to,
        current,
        description
    } = req.body; 

        const newEducation = {
            school,
            degree,
            fieldofstudy,
            location,
            from,
            to,
            current,
            description

        };


        try {
            
            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(newEducation);

            await profile.save();

            res.json(profile);

        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server error when adding new education');
        }

    }
); 

//@route DELETE api/profile/education/:edu_id
//@desc delete profile education  
//@access Privte
router.delete('/education/:edu_id', auth ,async (req,res) => {
    
    try {
        
        const profile = await Profile.findOne({ user: req.user.id });

        
        //get remove index 
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        profile.education.splice(removeIndex , 1);


        await profile.save();

        res.json(profile);

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error when deleting profile experience');
    }

}
); 




module.exports = router;