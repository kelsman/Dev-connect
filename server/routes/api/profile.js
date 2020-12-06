const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/user');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');
const axios = require('axios');
// const { findOneAndUpdate } = require('../../models/user');


//@route Get api/profile/me
//@desc Get current user profile
//@access Private
router.get('/me', auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({ user: req.user }).populate('user', "name");
        if (!profile) {
            return res.status(400).json({ msg: "there is no profile for this user" });
        }
        res.json(profile)
    } catch (err) {
        console.log(err.message);
        res.status(500).send("server error")
    }
});

//@route POST api/profile
//@desc create or update a user profile
//@access Private
router.post('/', [
    auth,
    [
        check('status', 'status is required').not().isEmpty(),
        check('skills', 'skills is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    //destructure the request
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,

        youtube,
        twitter,
        facebook,
        linkedin,
        instagram,
        // spread the rest of the fields we don't need to check
        ...others
    } = req.body;

    const profileFields = {};

    profileFields.user = req.user;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(', ').map((skill) => skill.trim())
    }
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;

    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;

    if (linkedin) profileFields.social.linkedin = linkedin
    if (instagram) profileFields.social.instagram = instagram

    try {
        let profile = await Profile.findOne({ user: req.user });
        if (profile) {
            //update
            profile = await Profile.findOneAndUpdate({ user: req.user }, { $set: profileFields }, { new: true })
            res.json(profile);
        }
        //create profile if not found
        profile = new Profile(profileFields);
        profile.save();

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }

});

//@route Get api/profile
//@desc Get all prfiles
//@access Public

router.get('/all/profiles', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name']);
        res.json(profiles)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "server error" })
    }
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {

    try {
        const profiles = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name']);
        if (!profiles) return res.status(400).json({ msg: "there is no profile" })
        res.json(profile)
    } catch (error) {
        console.error(error.message);
        if (error.kind == "ObjectId") {
            return res.status(400).json({ msg: "profile not found" })
        }
    }
});

// @route    DELETE api/profile
// @desc     Delete profile, user and post
// @access   Private
router.delete('/delete', auth, async (req, res) => {

    try {
        //@todo - remove users posts


        //Remove profile
        await Profile.findOneAndRemove({ user: req.user });

        //remove user
        console.log(req.user.id)
        await User.findOneAndRemove({ _id: req.user });
        res.json({ msg: "user deleted" })


    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: error.message });
    }
});
router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required and needs to be from the past')
                .not()
                .isEmpty()

        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        };

        try {
            const profile = await Profile.findOne({ user: req.user });

            if (!profile)
                return res.status(400).json({ msg: "profile does not exist" });

            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile);


            // await profile.save();

            // res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {

    try {
        const foundProfile = await Profile.findOne({ user: req.user });
        //Get remove index
        foundProfile.experience = foundProfile.experience.filter(
            (exp) => exp._id.toString() !== req.params.exp_id
        );

        await foundProfile.save();
        return res.status(200).json(foundProfile);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
});


// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
    '/education',
    [
        auth,
        [
            check('school', 'School is required').not().isEmpty(),
            check('degree', 'Degree is required').not().isEmpty(),
            check('fieldofstudy', 'Field of study is required').not().isEmpty(),
            check('from', 'From date is required and needs to be from the past')
                .not()
                .isEmpty()
                .custom((value, { req }) => (req.body.to ? value < req.body.to : true))
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        };

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const foundProfile = await Profile.findOne({ user: req.user.id });
        foundProfile.education = foundProfile.education.filter(
            (edu) => edu._id.toString() !== req.params.edu_id
        );
        await foundProfile.save();
        return res.status(200).json(foundProfile);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
});


// @route    GET api/profile/github/:username
// @desc   Get user repos from github
// @access   Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get(githubClientId)}&client_secret=${config.get(githubClientSecret)}`
        };
        const headers = {
            'user-agent': 'node.js',
            Authorzation: { 'user-agent': 'node.js' }
        }
        const gitHubResponse = await axios.get(options, { headers });
        return res.json(gitHubResponse.data);
    } catch (error) {
        console.error(errro.message);
    }
})


module.exports = router;