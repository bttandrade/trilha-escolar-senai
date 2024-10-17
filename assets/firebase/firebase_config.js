import admin from 'firebase-admin';

const serviceAccount = require('./trilha-educacional-5e1cb-firebase-adminsdk-pkl5h-0828d8aa0f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

export { db, auth };