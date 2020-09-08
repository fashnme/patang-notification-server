const { admin } = require('../conf/fcm')

const sendFirebaseNotification = async (registrationToken, notificationPayload, notificationCustomData) => {
    let notification = {
        token: registrationToken,
        // "dAMqQ3qqQx6LskNRhiD1Mb:APA91bG6K9Vw3GHwM2N7yJYxLEru9opXV-AoP8NFaHZXgfSGqBKw4HqZtIFxdwTEc54FVt8zTPymgyRZiOts7e9_iA9lPVx0MrCE1OrmLPX1qiwnyUZ6G3oRJGkZhDCBIUhGWgoouCus"],
        // token: 'cSxn2Gl7SM6Y1OjayxOwO7:APA91bHqPB2JR8BRHd71fCRo1J8cpCP2QwM7Syy1ZMLn8tMHIr6WhQn85HcJgSdo-xkoxXEGju8zUBgrWxWw3JdAQN2ogGaMUxJ7AMcQoUOz9uNbqg2zZJL_h_lxY9fTzHEE8-RcoxA8',
        // token: 'dAMqQ3qqQx6LskNRhiD1Mb:APA91bG6K9Vw3GHwM2N7yJYxLEru9opXV-AoP8NFaHZXgfSGqBKw4HqZtIFxdwTEc54FVt8zTPymgyRZiOts7e9_iA9lPVx0MrCE1OrmLPX1qiwnyUZ6G3oRJGkZhDCBIUhGWgoouCus',
        notification: notificationPayload,
        android: {
            ttl: 86400,
            notification: {
                imageUrl: notificationCustomData.image2 || notificationCustomData.image1,

            },
        },
        data: {
            ...notificationCustomData,
            ...notificationPayload,
        }

    }

    if (typeof notification.token == 'object') {
        const subscribedToTopic = await admin.messaging().subscribeToTopic(notification.token, 'randomtopic').catch(e => {
            console.log(e)
        })
        console.log('Successfully subscribed to topic:', subscribedToTopic);

        if (!subscribedToTopic) {
            return null;
        }

        delete notification['token'];
        // console.log({ ...notification, topic: 'randomtopic' })
        // let data = await admin.messaging().send({ ...notification, topic: 'randomtopic' }).catch(e => { console.log(e) })
        // if (!data) {
        //     return null
        // }
        return notification.data;


    } else {
        let data = await admin.messaging().send(notification).catch(e => { console.log(e) })
        if (!data) {
            return null
        }
        return notification.data;

    }

}

module.exports = { sendFirebaseNotification }