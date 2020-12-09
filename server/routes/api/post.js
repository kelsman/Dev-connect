const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth');
const { findById } = require('../../models/Post');

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
});
// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private

router.delete('/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        };
        //check user
        if (post.user.toString() !== req.user) {
            return res.status(401).json({ msg: 'User not authrised' });
        };
        await post.remove((err) => {
            if (!err) {
                return res.json({ msg: "post deleted" });
            }
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).send('Server Error');
    }
});
// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private

router.put('/like/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        };
        //check if the post has alraedy been liked
        if (post.likes.some(like => like.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Post already liked' });
        }
        post.likes.unshift({ user: req.user });
        await post.save((err) => {
            if (!err) {
                res.json(post.likes)
            }
        });


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put('/unlike/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        };
        //check if the post has not alraedy been liked
        if (!post.likes.filter(like => like.user.toString() === req.user)) {
            return res.status(400).json({ msg: "post not liked" });
        };
        post.likes = post.likes.filter(({ user }) => user.toString() !== req.user);
        await post.save((err) => {
            if (!err) {
                return res.json({ msg: "unliked post" })
            }
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private

router.post('/comment/:id', [auth, [check('text', 'text is required').not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user).select("-password");
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            user: req.user
        };
        post.comments.unshift(newComment);
        await post.save((err) => {
            if (!err) {
                return res.json(post.comments);
            }
        })

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})
// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private


router.delete('/comments/:postId/:commentId', auth, async (req, res) => {
    try {
        //first method
        // const post = await Post.findByIdAndUpdate(req.params.postId, {
        //     $pull: { 'comments': { _id: req.params.commentId } }
        // }, { new: true }
        // );
        // if (!post) {
        //     return res.status(400).send("Post not found");
        // }
        // await post.save((err) => {
        //     if (!err) {
        //         return res.json(post)
        //     }

        // })
        const post = await Post.findById(req.params.postId);
        const comment = post.comments.find((comment) => { return comment.id === req.params.commentId })
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' });
        }
        if (comment.user.toString() !== req.user) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        post.comments = post.comments.filter(
            ({ id }) => id !== req.params.commentId
        );
        await post.save((err) => {
            if (!err) {
                return res.json(post.comments);
            }
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
})

module.exports = router;