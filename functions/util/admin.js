
var admin = require("firebase-admin");


var serviceAccount = require("../keys/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialape-689a2.firebaseio.com"
});
const db = admin.firestore();

module.exports = { admin, db }