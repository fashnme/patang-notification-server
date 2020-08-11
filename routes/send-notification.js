const { sendFirebaseNotification } = require("../controllers/send-firebase-notification");
const { getDocumentDetails } = require("./../controllers/get-document-details");
const { esClient, esClientProduct } = require("../conf/elastic-conf");

const esQueryObjectForDoc = (_index, _id, _source) => { return { _index, _id, _source } };
const sendNotification = async (req, res) => {

    let notificationPayload, notificationCustomData, registrationToken;

    if (req.body.notificationType === 'like_post') {
        try {

            let { userId, posterId, postId } = req.body.notificationData;

            // Like Post Notification
            let [fromUser, toUser, post] = await getDocumentDetails([
                esQueryObjectForDoc('user', userId, ["fullName", "profilePic"]),
                esQueryObjectForDoc('user', posterId, ["registrationToken"]),
                esQueryObjectForDoc('post', postId, ["uploadUrl", "thumbnailUrl"])
            ]).catch(e => {
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
                toUser: posterId,
                likerId: userId,
                postId: postId,
                notificationAction: req.body.notificationType,
                image1: fromUser.profilePic,
                image2: post._source.thumbnailUrl || post._source.uploadUrl
            }

            registrationToken = toUser._source.registrationToken;


        } catch (error) {
            return res.status(500).send('NotificationBody is Wrong');
        }

    }
    else if (req.body.notificationType === 'comment_post') {
        try {

            let { userId, postId, posterId, commentText } = req.body.notificationData;

            // Like Post Notification
            let [fromUser, toUser, post] = await getDocumentDetails([
                esQueryObjectForDoc('user', userId, ["fullName", "profilePic"]),
                esQueryObjectForDoc('user', posterId, ["registrationToken"]),
                esQueryObjectForDoc('post', postId, ["uploadUrl", "thumbnailUrl"])
            ]).catch(e => {
                console.log('rejected', e);
                return res.status(500);
            });

            // Notification payload compulsary
            notificationPayload = {
                title: `${fromUser._source.fullName} commented on your post`,
                body: `${commentText}`
            }

            // CustomData post id for performing app activity, notificationAction, image
            notificationCustomData = {
                toUser: posterId,
                likerId: userId,
                postId: postId,
                notificationAction: req.body.notificationType,
                image1: fromUser.profilePic,
                image2: post._source.thumbnailUrl || post._source.uploadUrl
            }

            registrationToken = toUser._source.registrationToken;


        } catch (error) {
            return res.status(500).send('NotificationBody is Wrong');
        }

    }
    else if (req.body.notificationType === 'follow_user') {

        try {
            let { follower, following } = req.body.notificationData;

            // Follow User Notification
            let [fromUser, toUser] = await getDocumentDetails([
                esQueryObjectForDoc('user', follower, ["fullName", "userId", "profilePic"]),
                esQueryObjectForDoc('user', following, ["registrationToken"]),
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
                toUser: following,
                followerId: follower,
                notificationAction: req.body.notificationType,
                image: fromUser._source.profilePic
            }

            registrationToken = toUser._source.registrationToken;

        } catch (e) {
            return res.status(500).send('NotificationBody is Wrong');

        }
    }
    else if (req.body.notificationType === 'referred_user') {

        try {
            let { referrerId, referredUserId } = req.body.notificationData;

            // Follow User Notification
            let [fromUser, toUser] = await getDocumentDetails([
                esQueryObjectForDoc('user', referredUserId, ["fullName", "userId", "profilePic"]),
                esQueryObjectForDoc('user', referrerId, ["registrationToken"]),
            ]).catch(e => {
                console.log('rejected', e);
                return res.status(500);
            });

            // Notification payload compulsary
            notificationPayload = {
                title: `Referral Notification`,
                body: `${fromUser._source.fullName} accepted your invitation to join Patang`
            }

            // CustomData post id for performing app activity, notificationAction, image
            notificationCustomData = {
                toUser: referrerId,
                referredUserId: referredUserId,
                notificationAction: req.body.notificationType,
                image1: fromUser._source.profilePic
            }

            registrationToken = toUser._source.registrationToken;

        } catch (e) {
            return res.status(500).send('NotificationBody is Wrong');

        }
    }
    else if (req.body.notificationType === 'patang_message') {
        try {
            let { userId, image, body, title } = req.body.notificationData;

            // Follow User Notification
            let [toUser] = await getDocumentDetails([
                esQueryObjectForDoc('user', userId, ["registrationToken"]),
            ]).catch(e => {
                console.log('rejected', e);
                return res.status(500);
            });

            // Notification payload compulsary
            notificationPayload = {
                title: `${title}`,
                body: `${body}`
            }

            // CustomData post id for performing app activity, notificationAction, image
            notificationCustomData = {
                toUser: userId,
                referredUserId: referredUserId,
                notificationAction: req.body.notificationType,
                image1: image
            }

            registrationToken = toUser._source.registrationToken;

        } catch (e) {
            return res.status(500).send('NotificationBody is Wrong');

        }

    }
    else if (req.body.notificationType === 'open_profile') {
        try {
            let { userId, profileId } = req.body.notificationData;

            // Follow User Notification
            let [toUser, fromUser] = await getDocumentDetails([
                esQueryObjectForDoc('user', userId, ["registrationToken"]),
                esQueryObjectForDoc('user', profileId, ["fullName", "profilePic"])
            ]).catch(e => {
                console.log('rejected', e);
                return res.status(500);
            });

            // Notification payload compulsary
            notificationPayload = {
                title: `Patang Notification`,
                body: `Check out trending profile of ${fromUser._source.fullName}`
            }

            // CustomData post id for performing app activity, notificationAction, image
            notificationCustomData = {
                toUser: userId,
                profileId: profileId,
                notificationAction: req.body.notificationType,
                image1: fromUser._source.profilePic
            }

            registrationToken = toUser._source.registrationToken;

        } catch (e) {
            return res.status(500).send('NotificationBody is Wrong');

        }

    }
    else if (req.body.notificationType === 'open_post') {
        try {
            let { userId, postId } = req.body.notificationData;

            // Follow User Notification
            let [toUser, fromPost] = await getDocumentDetails([
                esQueryObjectForDoc('user', userId, ["registrationToken"]),
                esQueryObjectForDoc('user', postId, ["thumbnailUrl", "uploadUrl"])
            ]).catch(e => {
                console.log('rejected', e);
                return res.status(500);
            });

            // Notification payload compulsary
            notificationPayload = {
                title: `Patang Notification`,
                body: `Check out this trending post ${fromPost._source.caption}`
            }

            // CustomData post id for performing app activity, notificationAction, image
            notificationCustomData = {
                toUser: userId,
                postId: postId,
                notificationAction: req.body.notificationType,
                image1: fromPost._source.thumbnailUrl || fromPost._source.uploadUrl
            }

            registrationToken = toUser._source.registrationToken;

        } catch (e) {
            return res.status(500).send('NotificationBody is Wrong');

        }

    }
    else {
        return res.status(400).end();
    }

    await sendFirebaseNotification(registrationToken, notificationPayload, notificationCustomData).then(data => {
        esClient.index({
            index: 'notification',
            body: {
                ...notificationCustomData,
                ...notificationPayload,
                timeStamp: new Date(),
            }
        });
    }).catch(e => {
        console.log(e);
        if (registrationToken.length == 0) {
            return res.status(500).send('Wrong registration token');
        } else {
            esClient.update({
                index: 'user',
                id: notificationCustomData.toUser,
                body: {
                    doc: {
                        registrationToken: ''
                    }
                }
            });
        }


        return res.status(500).send('Wrong registration token');
    });

    return res.status(200).end();

}

module.exports = { sendNotification }