// the Cloud functions for firebase sdk to create cloud functions and triggers
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const SibApiV3Sdk = require("sib-api-v3-sdk");
SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey = `${process.env.SENDINGBLUEAPIKEY}`;


// The firebase admin sdk to access firestore.
const {initializeApp, applicationDefault} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {getAuth} = require("firebase-admin/auth");
const {getMessaging} = require("firebase-admin/messaging");
// var serviceAccount = require("../theokiddies-firebase.json");
initializeApp({
    credential: applicationDefault(),
});

// Export the initiali
const db = getFirestore();
const Auth = getAuth();
// const functions = onRequest;
module.exports = {db, Auth, onRequest, logger, FieldValue, SibApiV3Sdk, getMessaging};
