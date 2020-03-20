const functions = require('firebase-functions');


var admin = require("firebase-admin");


var serviceAccount = require("./keys/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialape-689a2.firebaseio.com"
});
const db = admin.firestore();


const express = require('express');
const app = express();

const firebaseConfig = {
    apiKey: "AIzaSyAJjgCdcQCLWD21AiQwC6lTe0sz0Bh6fLs",
    authDomain: "socialape-689a2.firebaseapp.com",
    databaseURL: "https://socialape-689a2.firebaseio.com",
    projectId: "socialape-689a2",
    storageBucket: "socialape-689a2.appspot.com",
    messagingSenderId: "140088231774",
    appId: "1:140088231774:web:2042a6309ed3bdf386b1cf",
    measurementId: "G-9YTF56YVJE"
};
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);



app.get('/screams', (req, res) => {
    db
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

    db.collection('screams').add(newScream)
        .then((doc) => {
            res.json({ message: `documnet ${doc.id} created ` })
        }).catch((err) => {
            res.status(500).json({ error: `something wrong` })
            console.error(err);
        });
});

const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}
const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) return true;
    else return false;
}
//Signup route:

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }

    let errors = {};

    //Validation the Data
    if (isEmpty(newUser.email)) {
        errors.email = 'Must not be empty'
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Email must be valid email address'
    }

    if (isEmpty(newUser.password)) errors.password = 'Must not be empty';
    if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
    if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty';


    if (Object.keys(errors).length > 0) return res.status(400).json(errors);
    let token, userId;

    //TODO: Validate data
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ handle: 'this handle is already taken' });
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            }
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                return res.status(400).json({ email: 'Email is already in use' });
            } else {
                return res.status(500).json({ error: err.code });
            }

        })


})

app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,

    }
    let errors = {};

    //Validation the Data
    if (isEmpty(user.email)) {
        errors.email = 'Must not be empty'
    } else if (!isEmail(user.email)) {
        errors.email = 'Email must be valid email address'
    }
    if (isEmpty(user.password)) errors.password = 'Must not be empty';
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === "auth/wrong-password") {
                return res.status(403).json({ general: "Wrong credentials, please try again" })
            } else return res.status(500).json({ error: err.code })
        })




})

// https://baseurl.com/api/
exports.api = functions.region('asia-east2').https.onRequest(app);