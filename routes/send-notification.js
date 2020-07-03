const { sendFirebaseNotification } = require("../controllers/send-firebase-notification");
const { getDocumentDetails } = require("./../controllers/get-document-details");
const { esClient } = require("../conf/elastic-conf");

const sendNotification = async (req, res) => {

    let notificationPayload, notificationCustomData, registrationToken;

    if (req.body.notificationType === 'like_post') {

        // Like Post Notification
        let [fromUser, toUser, post] = await getDocumentDetails([{
            _index: 'user',
            _id: req.body.notificationData.userId,
            _source: ["fullName"]
        }, {
            _index: 'user',
            _id: req.body.notificationData.posterId,
            _source: ["registrationToken", "userId"]
        }, {
            _index: 'post',
            _id: req.body.notificationData.postId,
            _source: ["uploadUrl"]
        }]).catch(e => {
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
            toUser: toUser._source.userId,
            postId: post._id,
            notificationAction: 'OPEN_POST',
            image: `${post._source.uploadUrl}`
        }

        registrationToken = toUser._source.registrationToken;
    }

    else if (req.body.notificationType === 'follow_user') {

        // Like Post Notification
        let [fromUser, toUser] = await getDocumentDetails([{
            _index: 'user',
            _id: req.body.notificationData.follower,
            _source: ["fullName", "userId", "profilePic"]
        }, {
            _index: 'user',
            _id: req.body.notificationData.following,
            _source: ["registrationToken", "userId"]
        }]).catch(e => {
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
            toUser: toUser._source.userId,
            postId: post._id,
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