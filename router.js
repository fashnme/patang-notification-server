const { sendNotification } = require("./routes/send-notification");
const { sendBulkNotification } = require("./routes/send-bulk-notification");

module.exports = function (app) {
    app.post('/send-notification', sendNotification);
    app.post('/send-bulk-notification', sendBulkNotification);
    app.get('/test', (req, res) => {
        return res.status(200).send('OK');
    })
}