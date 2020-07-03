const { sendNotification } = require("./routes/send-notification")

module.exports = function (app) {
    app.post('/send-notification', sendNotification);
    app.get('/test', (req, res) => {
        return res.status(200).send('OK');
    })
}