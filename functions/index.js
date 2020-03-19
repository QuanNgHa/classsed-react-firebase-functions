const functions = require('firebase-functions');


var admin = require("firebase-admin");

var serviceAccount = require("./keys/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialape-689a2.firebaseio.com"
});

const express = require('express');
const app = express();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions



app.get('/screams', (req, res) => {
    admin
        .firestore()
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let screams = [];
            data.forEach((doc) => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt

                });
            })
            return res.json(screams)
        }).catch((err) => console.error(err));
})


app.post('/scream', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    }

    admin.firestore().collection('screams').add(newScream)
        .then((doc) => {
            res.json({ message: `documnet ${doc.id} created ` })
        }).catch((err) => {
            res.status(500).json({ error: `something wrong` })
            console.error(err);
        });
});

// https://baseurl.com/api/
exports.api = functions.region('asia-east2').https.onRequest(app);