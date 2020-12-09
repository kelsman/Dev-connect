const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/user.js');

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post('/', [
    auth,
    [
        check('text', 'Text is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            user: req.user
        });

        const post = await newPost.save();

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}



);

// @route    GET api/posts
// @desc     Get all posts
// @access   Private

router.get('/', auth, async (req, res) => {

    try {
        const posts = await Post.find().sort({ date: -1 });
        res.status(201).json(posts);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('server error');
    }
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private

router.get('/:id', auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id).sort({ date: -1 });
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        };
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');

    }
})
module.exports = router;