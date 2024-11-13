
import admin from 'firebase-admin'
import * as dotenv from 'dotenv';
dotenv.config();

const seviceAccount=JSON.parse(process.env.FirebaseService as string)

admin.initializeApp({
    credential: admin.credential.cert(seviceAccount),
    
})

export async function sendNotification(fcmToken: string, title:string, body:string,pic:string) {
    const message = {
        token: fcmToken,
        notification: {
            title: title,
            body: body,
            image:pic
        } 
    }

    try {
        const response = await admin.messaging().send(message)
        console.log('Notification sent successfully:', response);
    } catch (error) {
        console.log('Notification sending failed:', error);
    }
}