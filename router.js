const { sendNotification } = require("./routes/send-notification")

module.exports = function (app) {
    app.post('/send-notification', sendNotification);
}