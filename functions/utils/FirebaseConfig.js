// Cloud Firestore
// const { initializeApp, cert } = require('firebase-admin/app');
// const { getFirestore } = require('firebase-admin/firestore');
// const serviceAccount = require('../../weathermap-441215-d86b41ecf0d1.json');

const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SA_KEY);
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

// Cloud Firestore
// const firebaseConfig = {
//     // apiKey: process.env.FIREBASE_API_KEY,
//     // authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//     // databaseURL: process.env.FIREBASE_DATABASE_URL,
//     // projectId: process.env.FIREBASE_PROJECT_ID,
//     // storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//     // messagingSenderId: process.env.FIREBASE_MSG_SENDER_ID,
//     // appId: process.env.FIREBASE_APP_ID
//     credential: cert(serviceAccount)
// };
//
// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
//
// // Initialize Firestore
// const db = getFirestore(app);
//
// module.exports = db;

const firebaseConfig = {
    //   credential: applicationDefault(),
    appId: process.env.APP_ID,
    projectId: process.env.PROJECT_ID,
    // The value of `databaseURL` depends on the location of the database
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    credential: admin.credential.cert(serviceAccount)
};

// Initialize Realtime Database and get a reference to the service
const app = admin.initializeApp(firebaseConfig);
const db = admin.database(app);
module.exports = db;
