const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');

const sendMail = async function (subject, text, email) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: 'qftdyvfzwmgjmync'
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject,
            html: text
        }

        transporter.sendMail(mailOptions);
        console.log("mail sent successfully!");
    } catch (error) {
        console.log("mail not sent! ", error.message);
    }
}


module.exports = sendMail
