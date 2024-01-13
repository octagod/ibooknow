const router = require('express').Router();
const verify = require('./authVerify');
const firestore = require('../db/config');

//get single user
router.post('/api/get-user', verify, (req, res) => {
    if(req.body.uid){
        firestore.collection('users').doc(req.body.uid).get()
        .then( doc => {
            res.json({status: "success", user: doc.data()});
        }).catch(err => {
            res.status(404).json({error: err.message});
        })
    }else{
        res.status(401).json({error: 'Could not find authorised ID'});
    }
});


module.exports = router;