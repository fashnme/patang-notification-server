const { sendFirebaseNotification } = require("../controllers/send-firebase-notification");
const { getDocumentDetails } = require("./../controllers/get-document-details");
const { esClient } = require("../conf/elastic-conf");

const esQueryObjectForDoc = (_index, _id, _source) => { return { _index, _id, _source } };
const sendBulkNotification = async (req, res) => {
    // console.log(req.body)
    let notificationPayload, notificationCustomData, allTokens = [], allUsers = [];
    if (req.body.notificationData.userType == 'male' || req.body.notificationData.userType == 'female') {
        let users = await esClient.search({
            index: 'user',
            size: 10000,
            _source: ['registrationToken'],
            body: {
                query: {
                    match: {
                        gender: req.body.notificationData.userType
                    }
                }
            }
        });
        users.hits.hits.forEach(user => {
            if (user._source.registrationToken) {
                allTokens.push(user._source.registrationToken)
                allUsers.push(user._id)
            }
        });
    }
    else if (req.body.notificationData.userType = 'all') {
        let users = await esClient.search({
            index: 'user',
            size: 10000,
            _source: ['registrationToken'],
            body: {
                query: {
                    match_all: {}
                }
            }
        });
        users.hits.hits.forEach(user => {
            if (user._source.registrationToken) {
                allTokens.push(user._source.registrationToken)
                allUsers.push(user._id)
            }
        });
    }

    if (req.body.notificationType === 'patang_message') {
        try {
            let { image, body, title } = req.body.notificationData;

            // Notification payload compulsary
            notificationPayload = {
                title: `${title}`,
                body: `${body}`
            }

            // CustomData post id for performing app activity, notificationAction, image
            notificationCustomData = {
                referredUserId: 'patang',
                notificationAction: req.body.notificationType,
                image1: image
            }
        } catch (e) {
            console.log(e);
            return res.status(500).send('NotificationBody is Wrong');

        }

    }
    else if (req.body.notificationType === 'open_profile') {
        try {
            let { profileId } = req.body.notificationData;

            // Follow User Notification
            let [fromUser] = await getDocumentDetails([
                esQueryObjectForDoc('user', profileId, ["fullName", "profilePic"])
            ]).catch(e => {
                console.log('rejected', e);
                return res.status(500);
            });

            // Notification payload compulsary
            notificationPayload = {
                title: `Patang: Trending Profile`,
                body: `Check out ${fromUser._source.fullName}'s Profile`
            }

            // CustomData post id for performing app activity, notificationAction, image
            notificationCustomData = {
                profileId: profileId,
                notificationAction: req.body.notificationType,
                image1: fromUser._source.profilePic
            }
        } catch (e) {
            return res.status(500).send('NotificationBody is Wrong');

        }

    }
    else if (req.body.notificationType === 'open_post') {
        try {
            let { postId } = req.body.notificationData;

            // Follow User Notification
            let [fromPost] = await getDocumentDetails([
                esQueryObjectForDoc('user', postId, ["thumbnailUrl", "uploadUrl"])
            ]).catch(e => {
                console.log('rejected', e);
                return res.status(500);
            });

            // Notification payload compulsary
            notificationPayload = {
                title: `Patang: Trending Post`,
                body: `Check out this trending post ${fromPost._source.caption}`
            }

            // CustomData post id for performing app activity, notificationAction, image
            notificationCustomData = {
                postId: postId,
                notificationAction: req.body.notificationType,
                image1: fromPost._source.thumbnailUrl || fromPost._source.uploadUrl
            }

        } catch (e) {
            return res.status(500).send('NotificationBody is Wrong');

        }

    }
    else if (req.body.notificationType === 'open_link') {
        try {
            let { link, body } = req.body.notificationData;

            // Notification payload compulsary
            notificationPayload = {
                title: `Patang Notification`,
                body: `${body}`
            }

            // CustomData post id for performing app activity, notificationAction, image
            notificationCustomData = {
                link: link,
                notificationAction: req.body.notificationType,
                image1: `${req.body.notificationData.image || 'https://res.cloudinary.com/patang1/image/upload/v1597860433/patang_hcztmo.png'}`
            }

        } catch (e) {
            return res.status(500).send('NotificationBody is Wrong');

        }

    }
    else if (req.body.notificationType === 'open_personal_store') {
        try {
            let { productId, productImage } = req.body.notificationData;

            // Notification payload compulsary
            notificationPayload = {
                title: `Patang Notification: Personal Store`,
                body: `We found this ${productTitle}`
            }

            // CustomData post id for performing app activity, notificationAction, image
            notificationCustomData = {
                productId: productId,
                notificationAction: req.body.notificationType,
                image1: productImage
            }

        } catch (e) {
            return res.status(500).send('NotificationBody is Wrong');

        }

    }
    else {
        return res.status(400).end();
    }

    // console.log(registrationToken, notificationPayload, notificationCustomData)
    console.log(allTokens, allUsers)
    let sentNotificationData = await sendFirebaseNotification(allTokens, notificationPayload, notificationCustomData).catch(e => {
        console.log(e);
    })

    if (sentNotificationData) {
        let body = [];

        allUsers.forEach(user => {
            body.push({ index: { _index: 'notification', _type: '_doc' } });
            body.push({
                toUser: user,
                ...sentNotificationData,
                timeStamp: new Date()
            })
        })

        console.log(body)

        await esClient.bulk({ body }).catch(e => {
            console.log(e);
        });


        // await esClient.index({
        //     index: 'notification',
        //     body: {
        //         ...sentNotificationData,
        //         timeStamp: new Date(),
        //     }
        // });
        return res.status(200).end();

    } else {
        return res.status(500).send('Wrong registration token');
    }



}

module.exports = { sendBulkNotification }
