const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const express = require('express');
const config = require('config');

const secret = config.get('JwtSecret');
const auth = require('../../middleware/auth');

//router declarartion
const router = express.Router();

//@access public
//@desc signusers up
router.post('/register',
    [
        body('name', "name is required").not().isEmpty(),
        body('email', "please enter a valid email address").isEmail(),
        // password must be at least 5 chars long
        body('password', "password must be at least 5 chars long").isLength({ min: 5 })
    ],
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "user already exists" });
            }
            const user = await new User({
                name,
                email,
                password
            });
            //encrypt user password before saving to database

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            //save d user to the database
            await user.save((err) => {
                if (err) {
                    console.log(err.message)
                    return res.status(400).json({ msg: "error in sign up" })
                } else {
                    return res.status(201).json({ msg: "sucessfully regsitered user" })
                }
            });



        } catch (err) {
            res.status(500).json({
                success: false,
                msg: "server error" + ":" + err.message
            });
        }
    });

//@access public
//@desc login user
router.post('/login',
    [
        body('email', "please enter a valid email address").isEmail(),
        // password must be at least 5 chars long
        body('password', "password must be at least 5 chars long").not().isEmpty()
    ], async (req, res) => {

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            //check if user exists in the database
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ success: false, msg: "invalid credentials" });
            };
            //if there is a user we have to compare the password;
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).jsn({ msg: "invalid credentials" });
            }
            //set the payload
            const payload = {

                id: user._id
            };

            jwt.sign(payload, secret, { expiresIn: 36000 }, (err, token) => {

                if (err) {
                    console.log(err.message);
                    return res.status(500).json("server error");
                } else {

                    return res.status(201).json({
                        success: true,
                        token,

                    });
                }
            })

        } catch (err) {

            res.status(500).json({
                success: false,
                msg: "server error" + ":" + err.message
            });
        }
    });


//@acess private
//@desc get userinfo from db
//Get request
router.get('/', auth, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select('-password')
        if (user) {
            return res.json(user);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@acess private
//@desc Deltete user fromdb
//DELETE request
router.delete('/', auth, async (req, res) => {

    try {
        console.log(req.user)
        await User.findByIdAndDelete({ _id: req.user });
        res.json({ msg: "user deleted" })
    } catch (error) {
        console.error(error.message);
        res.json({ msg: error.message })
    }
});
module.exports = router;