// IMPORTS
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const firestore = require('../db/config');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');





// validation schema
const registerSchema = joi.object({
    firstname: joi.string().min(3).required(),
    lastname: joi.string().min(3).required(),
    email: joi.string().min(4).required().email(),
    password: joi.string().min(8).required(),
    company: joi.string().required()
});

const loginSchema = joi.object({
    email: joi.string().min(3).required().email(),
    password: joi.string().min(8).required(),
    "remember_me": joi.boolean().required()
});

// test user 
// email: firstuser@gmail.com
// password: 12345678DFGH567

//create nodemailer transporter
const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
        user: "support@ibooknow.digital",
        pass: 'chidiogo99'
    }
});

router.post('/api/login', (req, res) => {
    try{
        //check if variables are correct
        loginSchema.validateAsync(req.body)
        .then(val => {
            //check if email exists
            firestore.collection('users').where('email', '==', val.email).get()
            .then(snap => {
                if(snap.docs.length == 1){
                    //confirm password matches user found
                    snap.docs.forEach(doc => {
                        let hashedPasword = doc.data().password;
                        //check if password is correct
                        bcrypt.compare(req.body.password,hashedPasword, (err, result) => {
                            if(result) {
                                //log user in
                                //assign a token to user with JWT
                                const token = jwt.sign({id: doc.id}, process.env.TOKEN_SECRET);
                                // Set cookie max age depending on user's selection in the frontend
                                let expireDate = 1000 * 3 * 24 * 60 * 60;
                                let oneDay = 1000 * 24 * 60 * 60;
                                //set cookie
                                res.cookie('token', token, {httpOnly: true, maxAge: req.body['remember_me'] ? expireDate : oneDay});
                                res.header('auth-token', token).json({status: "success",uid: doc.id});
                            }else{
                                res.status(401).json({error: 'Password incorrect'});
                            }
                        })
                    })
                }else{
                    res.status(404).json({error: 'email not found'})
                }
            })
        }).catch(err => {
            res.status(400).json({error: err.message});
            console.log(err);
        })
    
    }catch(err){
        console.log(err.message);
        res.status(err.code).json({error: err.message});
    }
});

router.post('/api/signup', async (req, res) => {
    
    //check if the fname, email and password are valid
    registerSchema.validateAsync(req.body)
    .then (val => {
        //check if email exists
        firestore.collection('users').where('email', '==', val.email).get()
        .then(users => {
            if(users.docs.length == 0){
                //encrypt password
                bcrypt.genSalt(10, (err, salt) => {
                    //hash password
                    bcrypt.hash(val.password, salt, (err, hash) => {
                        //add user to database
                        firestore.collection('users').add({
                            "firstname" : val.firstname,
                            "lastname": val.lastname,
                            "email": val.email,
                            "company": val.company,
                            "password": hash,
                            "subscribed": false,
                            "timestamp": Date.now()
                        }).then(docRef => {
                            // add pexels, and widget variables
                            firestore.collection('users').doc(docRef.id).collection('pixel').add({
                                'mobile': 0,
                                'desktop': 0
                            }).then( doc_ref => {
                                // add default widget variables
                                firestore.collection('users').doc(docRef.id).collection('widget')
                                .doc('variables').set({
                                    currency: 'USD',
                                    'delivery fee - one way': '50',
                                    'delivery fee - round trip': '100',
                                    'gas pre payment': '20',
                                    'insurance': '250',
                                    'locations' : 'Houston, Texas - Acardia, California',
                                    'primary color': 'rgb(33, 149, 243)',
                                    'tolls pre payment': '12'
                                }).then(val => {
                                    //Successful
                                    res.status(200).json({status: "success"});
                                }).catch(err => {
                                    res.status(500).json({error: err.message});
                                })
                            }).catch(err => {
                                res.status(500).json({error: err.message});
                            })
                        }).catch(err => {
                            res.status(500).json({error: err.message});
                        })
                    })
                })

            }else{
                // send back an error starting that the user already exist
                res.status(400).json({error: "User already exists"});
            }
        })

    }).catch(err => {
        res.status(400).json({error: err.message});
        console.log(err);
    });

});

router.get('/api/isAuthenticated', (req,res) => {
    let token = req.cookies.token;
    if(!token) {
        res.status(401).json({error: 'User Unauthorised'})
    }else {
        try{
            const authenticated = jwt.verify(token, process.env.TOKEN_SECRET);
            if(authenticated) res.status(200).json({status: "success"});
        }catch(err){
            console.log(err.message);
            res.status(401).json({error: 'Unauthorised User'});
        }
    }
});

router.post('/api/forgotten-password', (req,res) => {
    // check if email exists
    firestore.collection('users').where('email','==', req.body.email).get()
    .then(snap => {
        if(snap.docs.length == 1){
            //send email to user's email
            const mailOptions = {
                from: 'support@ibooknow.digital',
                to: req.body.email,
                subject: 'Reset your iBookNow password',
                html: resetPasswordHTMLBody(snap.docs[0].data().firstname, req.body.email, snap.docs[0].id),
            }
            //send mail
            transporter.sendMail(mailOptions)
            .then(val => {
                //email sent successfully
                res.json({status: 'success'})
            }).catch(err => {
                console.log('while attempting to send mail:' +err.message);
            })
        }else{
            res.status(404).json({error: 'no email found'})//email doesn't exist
        }
    }).catch(err => {
        res.status(401).json({error: err.message});
    })
});

router.post('/api/reset-password', (req, res) => {
    console.log('contact')
    //check if email exists
    firestore.collection('users').where('email', '==', req.body.email).get()
    .then(snap => {
        if(snap.docs.length == 1){
            //update password
            //hash password
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    firestore.collection('users').doc(req.body.uid).update({
                        password: hash
                    }).then(snapshot => {
                        res.json({status: 'success'});
                    }).catch(err => {
                        res.status(401).json({error: 'There was an error, Try again'})
                    });
                })
            })
        }else{
            res.status(401).json({error: 'There seem to be an error with this request'});
        }
    }).catch(err => {
        res.status(401).json({error: err.message});
    })
});


router.get('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({status: "success"});
})


// Utility function
function resetPasswordHTMLBody(firstname, email, id) {
    return `
    <div style="background-color: #2196f3; padding: 20px; font-family:Tahoma; line-height: 1.5em;">
        <div style="background-color: rgb(36, 37, 41); padding: 20px; border-radius: 20px; color: white;">
            Hello ${firstname}, <br> <br>
            Click the button below to reset your password<br>
            <a href="https://dashboard.ibooknow.digital/reset/${email}?id=${id}"
            style="display: block; width: fit-content; padding: 20px; margin: 20px 0; color: white !important; text-decoration: none !important; background-color: #2196f3; border-radius: 10px; border: none;">
                Reset Password
            </a>
            If you didn't ask to reset your password, you can ignore this email.
            <br>Thanks, <br> <br>
            <small style="color: #2196f3;">
               <b>iBookNow</b> 
            </small>
        </div>
    </div>
    `
}

module.exports = router;