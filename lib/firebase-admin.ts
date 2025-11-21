import admin, { ServiceAccount } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

import serviceAccount from "../keys/adminsdk.json";

// Initialize Firebase Admin only if it hasn't been initialized yet
if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount as ServiceAccount)
	});
}

// Get a reference to your Firestore database
export const db = getFirestore();
