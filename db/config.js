var admin = require("firebase-admin");

const {getStorage} = require('firebase-admin/storage');

var serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://ibooknowserver.appspot.com'
});

const firestore = admin.firestore();

const storage = admin.storage();

module.exports = firestore;