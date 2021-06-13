const firebaseConfig = {
    apiKey: "AIzaSyAuZykkOCDWaGuuRbkKDr9CYKdCW2F3EHA",
    authDomain: "fellowship-a33cf.firebaseapp.com",
    projectId: "fellowship-a33cf",
    storageBucket: "fellowship-a33cf.appspot.com",
    messagingSenderId: "388653226061",
    appId: "1:388653226061:web:bffc3fc6f847113faca404",
    measurementId: "G-SZCFEPGWEX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const appCheck = firebase.appCheck();
appCheck.activate('6LfTWyIbAAAAABOnVKOgs3RYaSIGIALGusMlsTgb');


const auth = firebase.auth();
const db = firebase.firestore();

const usersRef = db.collection('usersCollection');
const feedsRef = db.collection('feedsCollection');

let storageRef = firebase.storage().ref();
const usersFilesStorage = storageRef.child('users');
const feedsFilesStorage = storageRef.child('feeds');


