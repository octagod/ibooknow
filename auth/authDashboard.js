const router = require('express').Router();
const verify = require('./authVerify');

router.get('/api/dashboard',verify, (req, res) => {
    //get data
});

module.exports = router;

