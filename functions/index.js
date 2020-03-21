const functions = require('firebase-functions');
const express = require('express');
const app = express();

const FBAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signup, login, uploadImage } = require('./handlers/users');

//Scream Route
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

//users route
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);

// https://baseurl.com/api/
exports.api = functions.region('asia-east2').https.onRequest(app);