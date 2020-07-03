const admin = require("firebase-admin");

const serviceAccount = require(`./../${process.env.PATANG_FIREBASE_ADMIN_SDK}`);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://patang-b3fce.firebaseio.com"
});

module.exports = { admin }