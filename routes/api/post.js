const express = require('express')
const router = express.Router();

router.post('/post', (req, res) => {
    res.status(200).send("Demo User")
})

module.exports = router;