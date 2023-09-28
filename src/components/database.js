import { firebase } from "googleapis/build/src/apis/firebase";
const firebaseConfig = {
  apiKey: "AIzaSyDdaQus9f-8iP7W7vnN0LvAeJguMw7Q0dI",
  authDomain: "khajiev13.firebaseapp.com",
  projectId: "khajiev13",
  storageBucket: "khajiev13.appspot.com",
  messagingSenderId: "251313691156",
  appId: "1:251313691156:web:2951faeed7100e50d8a501",
  measurementId: "G-6VJ8R069MF"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

const db = app.database()


const database = firebase.database();

const data = {
  timestamp: firebase.database.ServerValue.TIMESTAMP,
  query: 'Hello',
};

database.ref('queries')
  .push(data)
  .then(() => {
    console.log('Data pushed successfully');
  })
  .catch(error => {
    console.error('Error pushing data:', error);
  });