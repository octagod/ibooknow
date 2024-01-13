const router = require('express').Router();
const verify = require('./authVerify');
const firestore = require('../db/config');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const uuid = require('uuid-v4');
const formidable = require('formidable');
const objectsToCsv = require('objects-to-csv');
const path = require('path');
const fs = require('fs');



const bucket = admin.storage().bucket();



//upload car details to db
router.post('/api/add-car',verify, (req, res) => {

    //initiate formidable
    const form = formidable({multiples: true});
    
    //use token to get user id
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;
    
    //generate uuid for fire storage download token
    let storage_uuid = uuid();
    
    //metadata for the images
    const metadata = {
        metadata: {
            firebaseStorageDownloadTokens: storage_uuid
        },
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000'
    }
    
    form.parse(req, (err, fields, files) => {
        if(err){
            console.log(err);
        }else{
            //get length of images
            let imagesLength = Object.keys(files).length;
            console.log(imagesLength);
        
            //image url list
            let imageUrls = [];
            
            
            //add data to database
            firestore.collection('users').doc(uid).collection('cars')
            .add({
                'car name': fields.car_name,
                'car price': fields.car_price,
                'per charge': fields.per_charge,
                'description': fields.description,
                'doors': fields.car_door,
                'capacity': fields.capacity,
                'transmission': fields.transmission,
                'timestamp': Date.now()
            }).then( docRef => {
                //use for loop to add files to storage
                for(let x = 0; imagesLength > x; x++){
                    //create image name
                    // let imgName = `${req.fields.car_name}-image${x}.png`;
                    bucket.upload(files[`image${x}`].filepath, {gzip: true, metadata: metadata})
                    .then(async(val) => {
                        let metadata_bucket = await val[0].metadata.bucket;
                        let metadata_name = await val[0].metadata.name;

                        let imageUrl = `https://firebasestorage.googleapis.com/v0/b/${metadata_bucket}/o/${metadata_name}?alt=media&token=${storage_uuid}`;
                        console.log(imageUrl)
                        imageUrls.push(imageUrl);
                        //check if every download url has been added to the imageUrls 
                        if(imagesLength === imageUrls.length){
                            console.log(imageUrls);
                            //add the images
                            firestore.collection('users').doc(uid)
                            .collection('cars').doc(docRef.id).update({
                                images: imageUrls
                            }).then(val => {
                                //successful
                                res.json({status: 'success'});
                            }).catch(err => {
                                console.log(`${err.message}`)
                                res.status(400).json({error: 'Error 3: while saving image urls; err msg: '+err.message});
                            })
                        }
                    }).catch(err => {
                            res.status(400).json({error: 'Error 2: while saving image to storage; err msg: '+err.message});
                            console.log(err.message);
                    })
                }
            }).catch(err => {
                res.status(400).json({error: 'Error 1: while saving text data; err msg: '+err.message});
                console.log(err.message);
            })
        }
    })

});


router.get('/api/get-cars', verify, (req, res) => {
    //get user id
    const token = req.cookies.token;
    if(!token) res.status(401).json({error: 'Unauthorised User'});

    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    const uid = verify.id;

    //query firstore
    firestore.collection('users').doc(uid).collection('cars').orderBy('timestamp', 'desc').get()
    .then(snap => {
        res.json({status: 'success', cars: snap.docs});   
    }).catch(err => {
        res.status(400).json({error: err.message});
    })

});

router.post('/api/get-car', verify, (req, res) => {
    //get user id from token
    const token = req.cookies.token;
    if(!token) res.status(401).json({error: 'Unathorised User'});
    const verify = jwt.verify(token, process.env.TOKEN_SECRET);
    const uid = verify.id;

    firestore.collection('users').doc(uid).collection('cars')
    .doc(req.body.carId).get().then(doc => {
        let array = doc.data();
        res.json({status: 'success', car: array});
    }).catch(err => {
        res.status(400).json({error: err.message});
    })

});

router.post('/api/delete-car', verify, (req, res) => {
    //get user id from token
    const token = req.cookies.token;
    if(!token) res.status(401).json({error: 'Unathorised User'});
    const verify = jwt.verify(token, process.env.TOKEN_SECRET);
    const uid = verify.id;

    // delete car from db
    firestore.collection('users').doc(uid)
    .collection('cars').doc(req.body.carId).delete()
    .then(snap => {
        //check if car has any existing bookings
        firestore.collection('users').doc(uid)
        .collection('booked').where('carId', '==', req.body.carId).get()
        .then(snap => {
            if(snap.docs > 0){
               //delete the document
               firestore.collection('users').doc(uid).collection('booked').doc(snap.docs[0].id)
               .delete().then(val => {
                    res.json({status: 'success'});
               }).catch(err => {
                   res.status(400).json({error: err.message})
               })
            }else{
                res.json({status: 'success'});
            }
        }).catch(err => {
            res.status(400).json({error: err.message});
        })
    }).catch(err => {
        res.status(400).json({error: err.message});
    });
});


router.get('/api/booked-cars', verify, (req, res) => {
    // get user id from token
    const token = req.cookies.token;
    if(!token) res.status(401).json({error: 'Unauthorised User'});
    const verify = jwt.verify(token, process.env.TOKEN_SECRET);
    const uid = verify.id;

    //get booked cars from db
    firestore.collection('users').doc(uid).collection('booked').orderBy('timestamp', 'desc')
    .get().then(async(snap) => {
        //check if user has booked car collection
        if(snap.docs.length > 0){
            //use booked car ids to query the cars collection
            let cars = [];
            for(let x = 0; snap.docs.length > x; x++){
                //get car infomation with booked cars id and save to docs
                let doc = await firestore.collection('users').doc(uid).collection('cars').doc(snap.docs[x].id).get();
                cars.push(doc.data()); //add the data to booked cars array

                if(snap.docs.length == x+1){
                    res.json({status: 'success', cars: cars, booked_car_col_for_timeline: snap.docs});
                }
            }
        }else{
            res.json({status: 'success', cars: [], booked_car_col_for_timeline: []});
        }
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});

//get cars limit of 3
router.get('/api/booked-cars-3', verify, (req, res) => {
    // get user id from token
    const token = req.cookies.token;
    if(!token) res.status(401).json({error: 'Unauthorised User'});
    const verify = jwt.verify(token, process.env.TOKEN_SECRET);
    const uid = verify.id;

    //get booked cars from db
    firestore.collection('users').doc(uid).collection('booked').orderBy('timestamp', 'desc')
    .get().then(async(snap) => {
        if(snap.docs.length > 0){
            //use booked car ids to query the cars collection
            let cars = [];
            for(let x = 0; snap.docs.length > x; x++){
                //get car infomation with booked cars id and save to docs
                let doc = await firestore.collection('users').doc(uid).collection('cars').doc(snap.docs[x].id).get();
                cars.push(doc.data()); //add the data to booked cars array

                if( snap.docs.length == x+1 ){
                    res.json({status: 'success', cars: cars, booked_car_col_for_timeline: snap.docs.slice(0, 3)});
                }
            }
        }else{
            res.json({status: 'success', cars: [], booked_car_col_for_timeline: []});
        }
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});


router.post('/api/update-car-images', verify, (req, res) => {
    //get user id from token
    const token = req.cookies.token;
    if(!token) res.status(401).json({error: 'Unathorised User'});
    const verify = jwt.verify(token, process.env.TOKEN_SECRET);
    const uid = verify.id;

    firestore.collection('users').doc(uid).collection('cars').doc(req.body.carId)
    .update({
        images: req.body.images
    }).then(val => {
        res.json({status: 'success'});
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});


router.post('/api/update-car', verify, (req, res) => {
    //get user id from token
    const token = req.cookies.token;
    if(!token) res.status(401).json({error: 'Unathorised User'});
    const verify = jwt.verify(token, process.env.TOKEN_SECRET);
    const uid = verify.id;


    firestore.collection('users').doc(uid).collection('cars').doc(req.body.carId)
    .update({
        "car name": req.body.car_name,
        "car price": req.body.car_price,
        "door": req.body.doors,
        "capacity": req.body.capacity,
        "transmission": req.body.transmission,
        "per charge": req.body.per_charge,
        "description": req.body.description
    }).then(val => {
        res.json({status: 'success'});
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});

router.post('/api/upload-car-images', verify, (req, res) => {
    //initiate formidable
    const form = formidable({multiples: true});

    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    //generate uuid for fire storage download token
    let storage_uuid = uuid();

    //metadata for the images
    const metadata = {
        metadata: {
            firebaseStorageDownloadTokens: storage_uuid
        },
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000'
    }

    form.parse(req, (err, fields, files) => {
        if(err){
            console.log(err);
        }else{
            //get length of images
            let imagesLength = Object.keys(files).length;
            console.log(imagesLength);

            //image url list
            let imageUrls = [];

            //add data to database
            for(let x = 0; imagesLength > x; x++){
                bucket.upload(files[`image${x}`].filepath, {gzip: true, metadata: metadata})
                .then(async(val) => {
                    let metadata_bucket = await val[0].metadata.bucket;
                    let metadata_name = await val[0].metadata.name;

                    let imageUrl = `https://firebasestorage.googleapis.com/v0/b/${metadata_bucket}/o/${metadata_name}?alt=media&token=${storage_uuid}`;
                    console.log(imageUrl)
                    imageUrls.push(imageUrl);
                    //check if every download url has been added to the imageUrls 
                    if(imagesLength === imageUrls.length){
                        console.log(imageUrls);
                        //add the images
                        firestore.collection('users').doc(uid)
                        .collection('cars').doc(fields.carId).update({
                            images: imageUrls
                        }).then(val => {
                            //successful
                            res.json({status: 'success'});
                        }).catch(err => {
                            console.log(`${err.message}`)
                            res.status(400).json({error: 'Error 3: while saving image urls; err msg: '+err.message});
                        })
                    }
                }).catch(err => {
                    res.status(400).json({error: 'Error 2: while saving image to storage; err msg: '+err.message});
                    console.log(err.message);
                })
            }
        } 
    })
});

router.post('/api/booked-cars-details', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;


    firestore.collection('users').doc(uid).collection('booked').doc(req.body.carId)
    .collection('users').orderBy('timestamp', 'desc').get()
    .then(snap => {
        console.log(snap.docs);
        res.json({status: 'success', users: snap.docs})
    }).catch(err => {
        res.status(400).json({error: err.message})
    })
});


router.post('/api/delete-booked-user', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    //delete booked user
    firestore.collection('users').doc(uid).collection('booked').doc(req.body.carId)
    .collection('users').doc(req.body.userId).delete()
    .then(val => {
        res.json({status: 'success'})
    }).catch(err => {
        res.status(400).json({error: err.message})
    })
});


// check and delete booked cars without users
router.get('/api/check-booked-cars', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    firestore.collection('users').doc(uid).collection('booked').get()
    .then(snap => {
        //check each document
        snap.docs.forEach((doc, index) => {
            firestore.collection('users').doc(uid).collection('booked').doc(doc.id)
            .collection('users').get()
            .then(snapshot => {
                //check user-collection length
                if(snapshot.docs.length > 0){
                    // user-collection has data in it 
                    // Do nothing
                    if(snap.docs.length == index+1){
                        res.json({status: 'success'});
                    }
                }else{
                    //delete booked car 
                    // It has no user-collectcion
                    firestore.collection('users').doc(uid).collection('booked').doc(doc.id).delete()
                    .then(val => {
                        if(snap.docs.length == index+1){
                            res.json({status: 'success'}); //deleted booked car
                        }
                    }).catch(err => {
                        console.log(err.message);
                        if(snap.docs.length == index+1){
                            res.status(400).json({error: err.message})
                        }
                    })
                }
            }).catch(err => {
                if(snap.docs.length == index+1){
                    res.status(400).json({error: err.message})
                }
            })
        })
    }).catch(err => {
        res.status(400).json({error: err.message})
    })
});


// DASHBOARD QUERYIES
router.get('/api/v1/dashboard/main', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    //query firestore
    firestore.collection('users').doc(uid).collection('users').orderBy('timestamp', 'desc').get()
    .then(snap => {
        //save users 
        let users = snap.docs;
        //get cars
        firestore.collection('users').doc(uid).collection('cars').orderBy('timestamp', 'desc').get()
        .then(snapshot => {
            //save cars
            let cars = snapshot.docs;
            //get booked cars
            firestore.collection('users').doc(uid).collection('booked').orderBy('timestamp', 'desc').get()
            .then(snp => {
                //save booked
                let booked = snp.docs;
                //send to front end
                res.json({status: 'success', users, cars, booked});
            }).catch(err => {
                res.status(400).json({error: err.message});
            })
        }).catch(err => {
            res.status(400).json({error: err.message});
        })
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});

router.post('/api/v1/dahsboard/days-match', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    let day = req.body.day;
    //find users registered on the same day as the day variable
    firestore.collection('users').doc(uid).collection('users').where('registered on', '==', day).get()
    .then(snap => {
        res.json({status: 'success', users_length: snap.docs.length});
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});


//get pixel
router.get('/api/v1/dashboard/pixel', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    firestore.collection('users').doc(uid).collection('pixel').get()
    .then(snap => {
        res.json({status: 'success', desktop: snap.docs[0].data().desktop, mobile: snap.docs[0].data().mobile});
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});

//get requests
router.get('/api/v1/dashboard/requests', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    firestore.collection('users').doc(uid).collection('requests').orderBy('timestamp', 'desc').get()
    .then( async (snap) => {
        let cars = [];
        // check if there are requests
        if(snap.docs.length > 0){
            // get each car detail
            for(doc of snap.docs){
                firestore.collection('users').doc(uid).collection('cars').doc(doc.data().carId).get()
                .then(doc => {
                    cars.push(doc.data());
                    if(snap.docs.length == cars.length){
                        res.json({status: 'success', requests: snap.docs, cars: cars});
                    }
                })
            }
        }else{
            res.json({status: 'success', requests: [], cars: []})
        }
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});

router.get('/api/v1/dashboard/users', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    firestore.collection('users').doc(uid).collection('users').orderBy('timestamp', 'desc').get()
    .then(snap => {
        if(snap.docs.length > 0){
            res.json({status: 'success', users: snap.docs});
        }else{
            res.json({status: 'success', users: []});
        }
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});

// CREATING CSV FILES AND DOWNLOADING

router.get('/api/v1/download/empty_cart.csv', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    //get data from firstore
    firestore.collection('users').doc(uid).collection('users').where('status', '==', 'empty cart').get()
    .then(snap => {
        let data = [];
        //loop through docs to save to data
        for(let x = 0; snap.docs.length > x; x++){
            data.push(snap.docs[x].data());
            if(snap.docs.length == x+1){
                //create csv file and save to download
                new objectsToCsv(data).toDisk(`./downloads/${uid}-csv.csv`).then(val => {
                   //send to front end to be downloaded
                   res.download(path.join(__dirname, `../downloads/${uid}-csv.csv`));
                   //then delete file after 3 secs
                   setTimeout(() => {
                       fs.unlink(path.join(__dirname, `../downloads/${uid}-csv.csv`), (err) => {
                           if(err){
                               console.log(err)
                           }else{
                               console.log('file deleted');
                           }
                       })
                   }, 3000);
               });
            }
        }
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});


router.get('/api/v1/download/completed.csv', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    firestore.collection('users').doc(uid).collection('users').where('status', '==', 'completed').get()
    .then(snap => {
        let data = [] // this array will hold the data
        for(let x = 0; snap.docs.length > x; x++){
            data.push(snap.docs[x].data());
            if(snap.docs.length == x+1){
                //create the csv file from data array
                new objectsToCsv(data).toDisk(`./downloads/${uid}-csv.csv`).then(val => {
                    //send the file to the frontend for downloading
                    res.download(path.join(__dirname, `../downloads/${uid}-csv.csv`))
                    //delete file after 3 sec
                    setTimeout(() => {
                        fs.unlink(path.join(__dirname, `../downloads/${uid}-csv.csv`), (err => {
                            if(err){
                                console.log(err);
                            }else{
                                console.log('file deleted');
                            }
                        }))
                    }, 3000);
                })
            }
        }
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});

router.get('/api/v1/dashboard/widget-variables', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    firestore.collection('users').doc(uid).collection('widget').doc('variables').get()
    .then(doc => {
        res.json({status: 'success', variables: doc.data()});
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
});

router.post('/api/v1/dashboard/handle-request', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

        firestore.collection('users').doc(uid).collection('requests').doc(req.body.requestId)
        .update({
            'request type': req.body['request type']
        }).then(val => {
            res.json({status: 'success'})
        }).catch(err => {
            res.status(400).json({error: err.message});
        })
});


router.post('/api/v1/dashboard/update-variables', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    firestore.collection('users').doc(uid).collection('widget').doc('variables').update({
        'insurance' : req.body.insurance, 
        'delivery fee - one way' : req.body['delivery fee - one way'],
        'delivery fee - round trip' : req.body['delivery fee - round trip'],
        'gas pre payment': req.body['gas pre payment'],
        'tolls pre payment': req.body['tolls pre payment'],
        'currency': req.body.currency,
        'locations' : req.body.locations
    }).then(val => {
        res.json({status: 'success'})
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
})


router.post('/api/v1/dashboard/update-theme', verify, (req, res) => {
    //get user id from token
    let token = req.cookies.token
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    firestore.collection('users').doc(uid).collection('widget').doc('variables').update({
        'primary color' : req.body['primary color'], 
    }).then(val => {
        res.json({status: 'success'})
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
})

router.post('/api/v1/dashboard/update-user', verify, (req, res) => {
    // get user id from token
    let token = req.cookies.token;
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    firestore.collection('users').doc(uid).collection('users').doc(req.body.customerId)
    .update({
        status: req.body.status
    }).then(val => {
        res.json({status: 'success'})
    }).catch(err => {
        res.status(400).json({error: err.message})
    })
})


router.post('/api/v1/dashboard/delete-user', verify, (req, res) => {
    // get uid from cookie
    let token = req.cookies.token;
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    firestore.collection('users').doc(uid).collection('users').doc(req.body.customerId)
    .delete().then(val => {
        res.json({status: 'success'})
    }).catch(err => {
        res.status(400).json({error: err.message})
    })
});

router.get('/api/v1/dashboard/get-user-details', (req, res) => {
    // get user id from cookies
    let token = req.cookies.token;
    let verify = jwt.verify(token, process.env.TOKEN_SECRET);
    let uid = verify.id;

    firestore.collection('users').doc(uid).get()
    .then(doc => {
        res.json({status: 'success', user: doc.data()});
    }).catch(err => {
        res.status(400).json({error: err.message});
    })
})

//function to convert timestamp - Date.now() to required readable date

// const getDate = (timestamp) => {
//     let d = new Date(parseInt(timestamp));
//     let date = d.toString().substring(0, 15);
//     let arr = date.split(' ');
//      //arr[2] before arr[1] so that day int will come before month e.g 10 May
//     let dat = `${arr[0]}, ${arr[2]} ${arr[1]} ${arr[3]}`;
//     return dat;
// }

// UTILITY FUNCTIONS


module.exports = router;

