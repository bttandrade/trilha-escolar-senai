import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('./trilha-educacional-5e1cb-firebase-adminsdk-pkl5h-0828d8aa0f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'trilha-educacional-5e1cb.appspot.com'
});
const bucket = admin.storage().bucket();
const auth = admin.auth();
const db = admin.firestore();

export { db, auth, bucket };
