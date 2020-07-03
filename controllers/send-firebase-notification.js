const { admin } = require('../conf/fcm')

const sendFirebaseNotification = async (registrationToken, notificationPayload, notificationCustomData) => {
    return admin.messaging().send({
        token: registrationToken,
        notification: notificationPayload,
        android: {
            ttl: 86400,
            notification: {
                click_action: notificationCustomData.notificationAction,
                imageUrl: notificationCustomData.image
            }
        },
        data: notificationCustomData
    }).catch(e => {
        throw e;
    })
}

module.exports = { sendFirebaseNotification }
