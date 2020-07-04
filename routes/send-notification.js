const { sendFirebaseNotification } = require("../controllers/send-firebase-notification");
const { getDocumentDetails } = require("./../controllers/get-document-details");
const { esClient } = require("../conf/elastic-conf");

const esQueryObjectForDoc = (_index, _id, _source) => { return { _index, _id, _source } };
const sendNotification = async (req, res) => {

    let notificationPayload, notificationCustomData, registrationToken;

    if (req.body.notificationType === 'like_post') {

        // Like Post Notification
        let [fromUser, toUser, post] = await getDocumentDetails([
            esQueryObjectForDoc('user', req.body.notificationData.userId, ["fullName"]),
            esQueryObjectForDoc('user', req.body.notificationData.posterId, ["registrationToken"]),
            esQueryObjectForDoc('post', req.body.notificationData.postId, ["uploadUrl"])])
            .catch(e => {
                console.log('rejected', e);
                return res.status(500);
            });

        // Notification payload compulsary
        notificationPayload = {
            title: `Like Notification`,
            body: `${fromUser._source.fullName} liked your post`
        }

        // CustomData post id for performing app activity, notificationAction, image
        notificationCustomData = {
            toUser: toUser._id,
            postId: post._id,
            notificationAction: 'OPEN_POST',
            image: `${post._source.uploadUrl}`
        }

        registrationToken = toUser._source.registrationToken;
    }

    else if (req.body.notificationType === 'follow_user') {

        // Follow User Notification
        let [fromUser, toUser] = await getDocumentDetails([
            esQueryObjectForDoc('user', req.body.notificationData.follower, ["fullName", "userId", "profilePic"]),
            esQueryObjectForDoc('user', req.body.notificationData.following, ["registrationToken"]),
        ]).catch(e => {
            console.log('rejected', e);
            return res.status(500);
        });

        // Notification payload compulsary
        notificationPayload = {
            title: `Follow Notification`,
            body: `${fromUser._source.fullName} followed your profile`
        }

        // CustomData post id for performing app activity, notificationAction, image
        notificationCustomData = {
            toUser: toUser._id,
            userId: toUser._id,
            notificationAction: 'OPEN_PROFILE',
            image: `${fromUser._source.profilePic}`
        }

        registrationToken = toUser._source.registrationToken;
    }

    await sendFirebaseNotification(registrationToken, notificationPayload, notificationCustomData).catch(e => {
        console.log('here', e);
        return res.status(500).end();
    });

    await esClient.index({
        index: 'notification',
        body: {
            timeStamp: new Date(),
            ...notificationCustomData,
            ...notificationPayload
        }
    });

    return res.status(200).end();
}

module.exports = { sendNotification }