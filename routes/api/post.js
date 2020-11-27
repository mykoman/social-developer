const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')
const {check, validationResult} = require('express-validator')
const Post = require('../../Models/Post');
const User = require('../../Models/User');

/**
 * @route POST api/post/new
 * @description Create a post as a user
 * @returns object
 * @access private
 */
router.post('/new/post', [auth, [
    check('text', 'The post must contain some text').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) res.status(400).json({errors: errors.array()})
try {
    //get user details to populate post model
    const userId = req.user;
    const user = await User.findById(userId)
    const {avatar, name} = user; 
    const {text} = req.body
    const postData = {
        text,
        avatar,
        name,
        user: userId
    }
    const post = new Post(postData);
    await post.save();
    res.status(200).json(post)

} catch (err) {
    console.log(err.message)
        res.status(500).send("Server error")
}
    
})


/**
 * @route POST api/post/new/comment/:postId
 * @description Add a comment to a post
 * @returns object
 * @access private
 */
router.post('/new/comment/:postId', [auth, [
    check('text', 'The comment must contain some text').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) res.status(400).json({errors: errors.array()})
try {
    //get user details to populate post model
    const userId = req.user;
    const postId = req.params.postId;
    if(postId == null) return res.status(400).json({msg: "The comment you are about to add has no post reference"})

    //fetch the associated post
    const post = await Post.findById(postId)
    if(!post) return res.status(400).json({msg: "The comment you are about to add has no post reference"})
    const user = await User.findById(userId)
    const {avatar, name} = user; 
    const {text} = req.body
    
    const post = await Post.findById(postId);
    if(!post) res.status(400).json({msg: "The comment you are about to add has no post reference"})
    const commentData = {
        text,
        avatar,
        name,
        user: userId
    }
    post.comment.unshift(commentData);
    await post.save();
    res.status(200).json(post);

} catch (err) {
    console.log(err.message)
    res.status(500).send("Server error")
}
    
})


/**
 * @route PUT api/post/like/post/:postId
 * @description Like a post 
 * @returns object
 * @access private
 */
router.put('/like/post/:postId', [auth], async (req, res) => {
    
try {
    const user = req.user
    const postId = req.params.postId;
    const post = await Post.findById(postId)
    if(!post) return res.status(400).json({msg: "Cannot find the post reference"})
    //find the particular 
    const userLikeIndex = post.likes.map(like =>like.user).indexOf(user);
    if(userLikeIndex == -1){
        //post hasn't been liked before
        post.likes.unshift({user})
    }
    else{
        //like already exists 
        //let's remove that like
        post.likes.splice(userLikeIndex, 1)
    }
    
    await post.save();
    res.status(200).json(post)

} catch (err) {
    console.log(err.message)
        res.status(500).send("Server error")
}
    
})


/**
 * @route POST api/post/delete/post/:postId
 * @description Delete a post 
 * @returns object
 * @access private
 */

 router.delete('/delete/:postId', auth, async (req, res) =>{
    const user = req.user
    const postId = req.params.postId;
    try {
        await Post.findOneAndRemove({id:postId})
        res.status(200).json({msg: "Post deleted successfully"})
    } catch (err) {
       console.log(err.message)
       if(err.kind == "ObjectId")return res.status(400).json({msg: "Post id not found"})
       
       return res.status(400).send("Server error")
    }
    

 })

module.exports = router;