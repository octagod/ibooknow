const router = require('express').Router();
const firestore = require('../db/config');
const admin = require('firebase-admin');
const uuid = require('uuid-v4');
const formidable = require('formidable');
const nodemailer = require('nodemailer');


// FIREBASE STORAGE
const bucket =  admin.storage().bucket();

// setup nodemailer transporter 
const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
        user: "support@ibooknow.digital",
        pass: 'chidiogo99'
    }
})

router.post('/api/v1/widget/set-pixels', (req, res) => {
    const uid = req.body.userId;

    firestore.collection('users').doc(uid).collection('pixel').get()
    .then(snap => {
        snap.docs.forEach(doc => {
            if(req.body.viewport > 600){
                // desktop
                let desktop = doc.data().desktop;
                firestore.collection('users').doc(uid).collection('pixel').doc(doc.id)
                .update({
                    desktop: desktop+1
                }).then(val => {
                    res.json({status: 'success'});
                }).catch(err => {
                    res.status(400).json({error: err.message});
                });
            }else{
                // mobile
                let mobile = doc.data().mobile;
                firestore.collection('users').doc(uid).collection('pixel').doc(doc.id)
                .update({
                    mobile: mobile+1
                }).then(val => {
                    res.json({status: 'success'});
                }).catch(err => {
                    res.status(400).json({error: err.message});
                });
            }
        })
    }).catch(err => {
        res.status(400).json({error: err.message});
    });
})

router.post('/api/v1/widget/get-variables', (req, res) => {
    const uid = req.body.userId;

    firestore.collection('users').doc(uid).get()
    .then(user => {
        firestore.collection('users').doc(uid).collection('widget').doc('variables').get()
        .then(doc => {
            res.json({status: 'success', variables: doc.data(), user: user.data()});
        }).catch(err => {
            res.status(400).json({error: err.message});
        })
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});

router.post('/api/v1/widget/get-cars', (req, res) => {
    const uid = req.body.userId;

    firestore.collection('users').doc(uid).collection('cars').orderBy('timestamp', 'desc').get()
    .then(snap => {
        let cars = [];
        for(let x = 0; snap.docs.length > x; x++){
            cars.push(snap.docs[x].data());
            cars[x]['id'] = snap.docs[x].id; //add the doc id as a property in the object
            if(snap.docs.length == x+1){
                res.json({status: 'success', cars: cars})
            }
        }
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});


router.post('/api/v1/widget/add-user', (req, res) => {
    const uid = req.body.userId;
    let timestamp = Date.now();

    firestore.collection('users').doc(uid).collection('users').add({
        city: req.body.city,
        country: req.body.country,
        email: req.body.email, 
        firstname: req.body.firstname, 
        lastname: req.body.lastname,
        fullname: req.body.fullname, 
        phone: req.body.phone, 
        location: req.body.location,
        state: req.body.state, 
        'zip code': req.body['zip code'],
        status: req.body.status, 
        street: req.body.street,
        'registered on': getDate(timestamp),
        timestamp: timestamp
    }).then(docRef => {
        res.json({status: 'successfull', cid: docRef.id})

    }).catch(err => {
        res.status(400).json({error: err.message})
    })
})


router.post('/api/v1/widget/book-reservation', (req, res) => {
    
    // instantiate the formidable
    const form = formidable({multiples: false});
    
    // generate uuid for firebase download token
    let storage_uuid = uuid();

    
    // metadata for images
    const metadata = {
        metadata : {
            firebaseStorageDownloadTokens: storage_uuid
        },
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000'
    }
    
    form.parse(req, (err,fields, files) => {
        if(err){
            console.log(err.message)
        }else{
            // get data from frontend
            let uid = fields.userId;
            let customerId = fields.customerId;
            let data = JSON.parse(fields.data);

            let timestamp = Date.now();
            let imageUrl;

            //1. Add the carId, users info and options(insurance gas pre payment etc) to the requests collection
            firestore.collection('users').doc(uid).collection('requests').add({
                carId: data['car id'],
                city: data.city,
                country: data.country,
                'delivery fee - one way': data['selected variables'].includes('Delivery Fee - One Way'),
                'delivery fee - round trip': data['selected variables'].includes('Delivery Fee - Round Trip'),
                'drivers license number': data['dl_number'],
                email: data.email,
                'expiration date': data.expiry_date,
                firstname: data.firstname,
                'gas pre payment': data['selected variables'].includes('Gas Pre-Payment'),
                insurance: data['selected variables'].includes('Insurance'),
                lastname: data.lastname,
                phone: data.phone,
                'pickup date': data['pickup date'],
                'pickup location': data['pickup location'],
                'pickup time': data['pickup time'],
                'request type': 'pending',
                'return date': data['return date'],
                'return time': data['return time'],
                state: data.state,
                status: 'empty cart',
                street: data['street'],
                timestamp: timestamp,
                'tolls pre payment': data['selected variables'].includes('Tolls Pre-Payment'),
                'total cost': data['overall total'],
                'zip code': data['zip code']      
        
            }).then(docRef => {
                //save the driver's liecense image to firestore
                bucket.upload(files['image'].filepath,{gzip: true, metadata: metadata})
                .then(val => {
                    imageUrl = `https://firebasestorage.googleapis.com/v0/b/${val[0].metadata.bucket}/o/${val[0].metadata.name}?alt=media&token=${storage_uuid}`;
                    console.log(imageUrl);
                    // add the image url to the current request collection
                    firestore.collection('users').doc(uid).collection('requests').doc(docRef.id)
                    .update({
                        'drivers license': imageUrl
                    }).then(val => {
                        // 2. Add the carId and timestamp to booked collection [Check if carId already exists in the booked collection, if it does then update the timestamp ] - add the user’s info to booked(c) > carId(d) > users(c)
                        firestore.collection('users').doc(uid).collection('booked').doc(data['car id']).get()
                        .then(snap => {
                            // check if booked collection it exists
                            if(snap.docs){
                                //update the timestamp and add the user to it's users collection
                                firestore.collection('users').doc(uid).collection('booked').doc(data['car id'])
                                .update({
                                    timestamp: timestamp
                                }).then(val => {
                                    // add user's details to booked user collection
                                    firestore.collection('users').doc(uid).collection('booked').doc(data['car id'])
                                    .collection('users').add({
                                        fullname: data.fullname,
                                        email: data.email,
                                        phone: data.phone,
                                        status: 'empty cart',
                                        timestamp: timestamp 
                                    }).then( v => {
                                        //update user's timestamp
                                        firestore.collection('users').doc(uid).collection('users')
                                        .doc(customerId).update({
                                            timestamp: timestamp
                                        }).then(v => {
                                            // All done
                                            res.json({status: 'successfull'});
                                            // send an email to user
                                            // get the main user's email
                                            firestore.collection('users').doc(uid).get()
                                            .then(doc => {
                                                // send an email to company owner
                                                const mailOptions = {
                                                    from: 'support@ibooknow.digital',
                                                    to: doc.data().email,
                                                    subject: 'New booking activity',
                                                    html: htmlBody1(doc.data().firstname)
                                                }
                                                sendEmail(mailOptions);
                                                const mailOptions2 = {
                                                    from: 'support@ibooknow.digital',
                                                    to: data.email,
                                                    subject: 'Booking Successful',
                                                    html: htmlBody2(data.firstname, doc.data().company)
                                                }
                                                sendEmail(mailOptions2);
                                            }).catch(err => {
                                                console.log('1st error while getting main user\'s email');
                                            })
                                        }).catch(err => {
                                            console.log('error while updating user\'s collection');
                                            console.log(err.message);
                                            res.status(400).json({error: err.message})
                                        })
                                    }).catch(err => {
                                        console.log('error while updating booked user collection');
                                        console.log(err.message);
                                        res.status(400).json({error: err.message})
                                    })
                                }).catch(err =>{
                                    console.log('error while updating booked collection');
                                    console.log(err.message);
                                    res.status(400).json({error: err.message})
                                })
                            }else{
                                // create the collection and document and add the user to its users collection
                                firestore.collection('users').doc(uid).collection('booked').doc(data['car id']).set({
                                    carId: data['car id'],
                                    timestamp: timestamp
                                }).then(val => {
                                    // add user's details to the booked collection
                                    firestore.collection('users').doc(uid).collection('booked').doc(data['car id'])
                                    .collection('users').add({
                                        fullname: data.fullname,
                                        email: data.email,
                                        phone: data.phone,
                                        status: 'empty cart',
                                        timestamp: timestamp 
                                    }).then( v => {
                                        //update user's timestamp
                                        firestore.collection('users').doc(uid).collection('users')
                                        .doc(customerId).update({
                                            timestamp: timestamp
                                        }).then(v => {
                                            // All done
                                            res.json({status: 'successfull'});
                                            // send an email to user
                                            // get the main user's email
                                            firestore.collection('users').doc(uid).get()
                                            .then(doc => {
                                                // send an email to company owner
                                                const mailOptions = {
                                                    from: 'support@ibooknow.digital',
                                                    to: doc.data().email,
                                                    subject: 'New booking activity',
                                                    html: htmlBody1(doc.data().firstname)
                                                }
                                                sendEmail(mailOptions);
                                                const mailOptions2 = {
                                                    from: 'support@ibooknow.digital',
                                                    to: data.email,
                                                    subject: 'Booking Successful',
                                                    html: htmlBody2(data.firstname, doc.data().company)
                                                }
                                                sendEmail(mailOptions2);
                                            }).catch(err => {
                                                console.log('2nd error while getting main user\'s email');
                                            })
                                        }).catch(err => {
                                            console.log('error while updating user\'s collection');
                                            console.log(err.message);
                                            res.status(400).json({error: err.message})
                                        })
                                    }).catch(err => {
                                        console.log('error while updating booked collection');
                                        console.log(err.message);
                                        res.status(400).json({error: err.message})
                                    })
                                    
                                }).catch(err => {
                                    console.log('error while creating booked collection');
                                    console.log(err.message);
                                    res.status(400).json({error: err.message})
                                })

                            }
                        }).catch(err => {
                            console.log('error while checking booked collection');
                            console.log(err.message);
                            res.status(400).json({error: err.message})
                        })
                    }).catch(err => {
                        console.log('error while saving image to firestore');
                        console.log(err.message);
                        res.status(400).json({error: err.message})
                    })
                }).catch(err => {
                    console.log('error while saving image');
                    console.log(err.message);
                    res.status(400).json({error: err.message})
                })
            }).catch( err =>{
                res.status(400).json({error: err.message});
            })
        }
    })

})


// UTILITIES FUNCTION


//function to convert timestamp - Date.now() to required readable date

function getDate (timestamp) {
    let d = new Date(parseInt(timestamp));
    let date = d.toString().substring(0, 15);
    let arr = date.split(' ');
     //arr[2] before arr[1] so that day int will come before month e.g 10 May
    let dat = `${arr[0]}, ${arr[2]} ${arr[1]} ${arr[3]}`;
    return dat;
}

// UTILITY FUNCTIONS

function sendEmail(mailOptions) {
    transporter.sendMail(mailOptions).then(val => {
        console.log('Email sent successfully');
    }).catch(err => {
        console.log(`an error occured will attempting to send the mail: ${err.message}`);
    })
}

// BUSINESS OWNER MESSAGE BODY
function htmlBody1(firstname){
    return `<div style="background: #4255e9; padding: 5px; font-family: fantasy;">
    <div style="padding: 10px"></div>
    <div style="text-align: center;">
        <img src="https://firebasestorage.googleapis.com/v0/b/ibooknowserver.appspot.com/o/logo-bg.png?alt=media&token=de0275bb-0679-4cc2-bc27-b78e99cb9f34" alt="ibooknow logo" style="width: 250px;margin-bottom: -9px;">
    </div>
    <div style="padding: 20px; background-color: rgb(35, 36, 36); color: white; border-radius: 5px">
        <h4 style="color:#4255e9; margin-top: 0px">
            Hello ${firstname}
        </h4>
        <p>
            <b>Congrats!!</b>
            <br>You have a new booking activity on one of your cars.    
        </p>
        <p>
            Kindly log into your dashboard to find out more.
        </p>
        <br><br>
        <h5 style="color: #4255e9; margin-bottom: 5px">
            Happy automating,
        </h5>
        <small style="color:#4255e9">
            The iBookNow Team
        </small>
    </div>
    <div style="padding: 10px; border-bottom: 1px solid rgba(201, 201, 201, 0.137);"></div>
    <h5 style="color: white;">
        iBookNow
    </h5>
</div>`;
}

// CUSTOMER MESSAGE BODY
function htmlBody2(firstname, company){
    return `<div style="background: #4255e9; padding: 5px; font-family: fantasy;">
    <div style="padding: 10px"></div>
    <div style="text-align: center;">
        <h5 style="color: white; font-weight: bold; letter-spacing: 3px; text-transform: uppercase">${company}</h5>
    </div>
    <div style="padding: 20px; background-color: rgb(35, 36, 36); color: white; border-radius: 5px">
        <h4 style="color:#4255e9; margin-top: 0px">
            Hello ${firstname}
        </h4>
        <p>
            We have recieved your request and would get back to you shortly    
        </p>
        <p>
            Thank you for choosing ${company}
        </p>
        <br><br>
        <h5 style="color: #4255e9; margin-bottom: 5px">
            Regards,
        </h5>
        <small style="color:#4255e9">
            ${company} Team
        </small>
    </div>
    <div style="padding: 10px; border-bottom: 1px solid rgba(201, 201, 201, 0.137);"></div>
    <small style="color: white;">
        You recieved this email because you recently made a reservation for one of our vehicles.
    </small>
</div>`
}
// brand color #4255e9

module.exports = router;