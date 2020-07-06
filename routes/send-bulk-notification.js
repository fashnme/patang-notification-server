const { sendFirebaseNotification } = require("../controllers/send-firebase-notification");
const { esClient } = require("../conf/elastic-conf");

const sendBulkNotification = async (req, res) => {

    let notificationPayload, notificationCustomData, registrationToken;


    if (req.body.notificationType === 'like_post') {
        try {

            let { userId, posterId, postId } = req.body.notificationData;

            // Like Post Notification
            let [fromUser, toUser, post] = await getDocumentDetails([
                esQueryObjectForDoc('user', userId, ["fullName"]),
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
                toUser: toUser._id,
                postId: post._id,
                notificationAction: 'OPEN_POST',
                image: post._source.thumbnailUrl || post._source.uploadUrl
            }

            registrationToken = toUser._source.registrationToken;

        } catch (error) {
            return res.status(500).send('NotificationBody is Wrong');
        }

    }




    await sendFirebaseNotification(registrationToken, notificationPayload, notificationCustomData).then(data => {
        esClient.index({
            index: 'notification',
            body: {
                timeStamp: new Date(),
                ...notificationCustomData,
                ...notificationPayload
            }
        });
    }).catch(e => {
        console.log('here', e);

        esClient.update({
            index: 'user',
            id: notificationCustomData.toUser,
            body: {
                doc: {
                    registrationToken: ''
                }
            }
        });
        return res.status(500).send('Wrong registration token');
    });

    return res.status(200).end();

}

module.exports = { sendBulkNotification }