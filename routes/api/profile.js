const express = require('express')
const router = express.Router();
const User = require('../../Models/User')
const Profile = require('../../Models/Profile')
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const config = require('config')
const request = require('request')
const profile = require('../../Models/Profile');

/**
 * @route GET api/profile/personal
 * @description get the logged in user info
 * @access private
 * @returns json object of logged in user
 */
router.get('/personal', auth, async (req, res) => {
    
    const userId = req.user
    try {
        const user = await User.findById(userId).select("-password")
        if(!user) return res.status(400).send("Profile not found")

        return res.status(200).json(user)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }
    //res.status(200).send("My profile")
})

/***
 * @description save/ update user profile
 * @route POST api/profile
 * @access private
 * @returns users profile
 */
router.post('/', [ auth, [ 
    check('skills', 'Please add some skills to your profile').not().isEmpty(),
    check('status', 'Please fill in the status').not().isEmpty()
]
], async (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors : errors.array()})
    const user = req.user;
    //get input parameters
    const {company, website, location, bio, status, skills, githubUsername, facebook, twitter, youtube, linkedin, instagram}  = req.body

    //build profile object
    const profileObject = {};
    
    //check if parameters were set
    if(company) profileObject.company = company
    if(website) profileObject.website = website
    if(location) profileObject.location = location
    if(bio) profileObject.bio = bio
    if(status) profileObject.status = status
    if(githubUsername) profileObject.githubUsername = githubUsername
    profileObject.user = req.user
    console.log("userID", req.user.id)
    //skills were set as strings, we need to convert it to an array
    if(skills){
        const skillsArray = skills.split(',').map(skill => skill.trim())
        profileObject.skills = skillsArray;
    }

    //social profile details
    const social = {}
    if(facebook) social.facebook = facebook
    if(twitter) social.twitter = twitter
    if(youtube) social.youtube = youtube
    if(instagram) social.instagram = instagram
    if(linkedin) social.linkedin = linkedin

    profileObject.social = social;
    profileObject.updatedAt = Date.now()
    try {
        //check if a profile exists already
        let profile = await Profile.findOne({user}) //, {$set: profileObject}, {new: true}
        if(profile){
            //update
            
            profile = await Profile.findOneAndUpdate({user}, {$set: profileObject}, {new: true})
            return res.status(200).json(profile)
        }
        profile =  new Profile(profileObject)
        await profile.save();
        return res.status(200).json(profile)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send("Server error")
    }
    

    
})

/**
 * @route GET api/profile/all
 * @description return all profiles on the with their respective user details
 * @returns array of objects
 */
router.get('/all', [auth], async (req, res) =>{
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.status(200).json(profiles)
    } catch (err) {
        console.log(err.message)
        res.status(500).send("server error")
    }
})


/**
 * @route GET api/profile/user/:id
 * @description return profile of the set user via the id
 * @returns object
 */
router.get('/user/:id', [auth], async (req, res) =>{
    try {
        const userId = req.params.id
        const userProfile = await Profile.findOne({user: userId }).populate('user', ['name', 'avatar']);
        if(!userProfile) return res.status(400).json({msg: "No profile found"})
        res.status(200).json(userProfile)
    } catch (err) {
        console.log(err.message)
        if(err.kind == 'ObjectId') return res.status(400).json({msg: "No profile found"})
        res.status(500).send("server error")
    }
})

/**
 * @route DELETE api/profile/user/:id
 * @description THis deletes both the user profile and the user record
 * @returns object
 */
router.delete('/delete', [auth], async (req, res) =>{
    try {
        console.log('here');
        const userId = req.user
        //delete profile record
        await Profile.findOneAndRemove({user: userId })
        //delete user record
        await User.findOneAndRemove({id : userId})
        res.status(200).json({msg: "User profile successfully deleted"})
    } catch (err) {
        console.log(err.message)
        
        res.status(500).send("server error")
    }
})

/**
 * @route PUT api/profile/add/experience
 * @description Adds an experience to a profile
 * @returns object
 */
router.put('/add/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('from', 'Start date is required').not().isEmpty(),
    check('company', 'Company name is required').not().isEmpty(),
]], async (req, res) =>{
    const userId = req.user;
    const errors = validationResult(req);
    if(!errors.isEmpty()) res.status(401).json({errors: errors.array()})
    //get the profile of the logged in user 
    try {
        const userProfile = await Profile.findOne({user : userId});
        //build experience array
        const {company, title, from, location, to, current, description} = req.body
        const newExperience = {company, title, location, from, to, current, description}
        userProfile.experience.unshift(newExperience);
        await userProfile.save()  
        res.status(200).json(userProfile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send("Server error")
    }

} )

/**
 * @route DELETE api/profile/delete/experience/:id
 * @description Delete an experience from a profile
 * @returns object
 */
router.delete('/delete/experience/:id', [auth], async (req, res) =>{
    const userId = req.user;
    const experienceId = req.params.id
    //get the profile of the logged in user 
    try {
        const userProfile = await Profile.findOne({user : userId});
        const getIndexToDelete = userProfile.experience.map((exp, index) =>{
            //if(exp._id.toString() == experienceId) return index;
            return exp._id
        }).indexOf(experienceId)

        //indexOf returns -1 if not found
        //we need to accomodate for that knowing that the array will be deleting a wrong experience record if we splice with 
        //-1
        if(getIndexToDelete == -1) return res.status(400).json({msg: "Experince not found"})

        userProfile.experience.splice(getIndexToDelete, 1)
        
        await userProfile.save()  
        res.status(200).json(userProfile)
    } catch (err) {
        console.log(err.message)
        if(err.kind == 'ObjectId') return res.status(401).send("Profile does not exist")
        res.status(500).send("Server error")
    }

} )




    /**
     * @route PUT api/profile/add/education
     * @description Adds an education document to user profile
     * @returns object
     */
    router.put('/add/education', [auth, [
        check('school', 'School name is required').not().isEmpty(),
        check('from', 'Start date is required').not().isEmpty(),
        check('from', 'Start date is invalid').isDate(),
        check('to','End date format is invalid').isDate()
        
    ]], async (req, res) =>{
        const userId = req.user;
        const errors = validationResult(req);
        if(!errors.isEmpty())return res.status(401).json({errors: errors.array()})
        //get the profile of the logged in user 
        try {
            const userProfile = await Profile.findOne({user : userId});
            //build experience array
            const {school, fieldOfStudy, from, qualification, to, current, description } = req.body
            const education = {school, fieldOfStudy, from, qualification, to, current, description }
            userProfile.education.unshift(education);
            await userProfile.save()  
            res.status(200).json(userProfile)
        } catch (err) {
            console.log(err.message)
            res.status(500).send("Server error")
        }
    
    } )
    
    /**
     * @route DELETE api/profile/delete/education/:id
     * @description Delete an education record from a profile
     * @returns object
     */
    router.delete('/delete/education/:id', [auth], async (req, res) =>{
        const userId = req.user;
        const educationId = req.params.id
        //get the profile of the logged in user 
        try {
            const userProfile = await Profile.findOne({user : userId});
            const getIndexToDelete = userProfile.education.map(edu => edu._id).indexOf(educationId)
                
            //indexOf returns -1 if not found
            //we need to accomodate for that knowing that the array will be deleting a wrong education record if we splice with 
            //-1
            if(getIndexToDelete == -1) return res.status(400).json({msg: "Education record not found"})
    
            userProfile.education.splice(getIndexToDelete, 1)
            
            await userProfile.save()  
            res.status(200).json(userProfile)
        } catch (err) {
            console.log(err.message)
            if(err.kind == 'ObjectId') return res.status(401).send("Profile does not exist")
            res.status(500).send("Server error")
        }
    
    } )


    /**
     * @route DELETE api/profile/github/:username
     * @description Delete an education record from a profile
     * @returns object
     * @access public
     */
    router.get("/github/:username", (req, res)=>{
        const user = req.params.username;
        try {
            const clientId = config.get('githubClientId')
        const secret = config.get('githubClientSecret')
        const options ={
            url: `https://api.github.com/users/${user}/repos?per_page=5&sort=created:asc&client_id=${clientId}&client_secret=${secret}`,
            method: 'GET',
            headers: {'user-agent' : 'node.js'}
        }
        request(options, (err, response, body)=>{
            if(err) return res.status(500).json({msg: "Server error"})
            if(response.statusCode !== 200)return res.status(404).json({msg: "Profile not found"})
            res.json(JSON.parse(body))
        })
        } catch (error) {
            console.log(error)
            res.status(500).json({msg: "Server error"})
        }
        

    })


module.exports = router;