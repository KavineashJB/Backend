const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');
const User = require('./models/user_model');
const sendMail = require('./mail');
const dotenv = require('dotenv')

dotenv.config()
const env = process.env;

const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}))

app.options('*', cors());

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const findUser = await User.findOne({ email });
        if (!findUser) {
            const user = await User.create({ name, email, password });
            const token = await user.getToken();
            console.log(token);
            return (
                res.status(201).json({
                    success: true,
                    token
                })
            )
        } else {
            res.status(400).json({
                success: true,
                message: 'already registered!'
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'server error'
        })
    }
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const finduser = await User.findOne({ email });
        console.log(finduser);
        if (!finduser) {
            return (
                res.status(400).json({
                    success: false,
                    message: 'user not registered'
                })
            )
        }
        const userPass = await finduser.verifyPass(password)
        if (!userPass) {
            res.status(401).json({
                success: false,
                message: 'Password Incorrect!'
            })
        } else {
            res.status(200).json({
                success: true,
                message: 'login successfull!'
            })
        }
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'server error!'
        })
    }
})

app.post('/forgetpass', async (req, res) => {
    try {
        const { email } = req.body;
        const finduser = await User.findOne({ email });
        console.log(finduser);
        if (!finduser) {
            return (
                res.status(400).json({
                    success: false,
                    message: 'user not registered!'
                })
            )
        }
        const otp = await finduser.generateOtp();
        console.log(otp);
        console.log(finduser.forgetPassword);
        console.log(finduser);
        //saving the changes in database
        finduser.save();
        const name = finduser.name;
        const text = `<p style="display:block;text-align:center;font-size:20px;">Hi ${name ? name : ''}</p><div>Trouble to access your account? No problem, we're here to help. Don't share the OTP to anyone</div><br/><b style="width:100%;text-align:center;">${otp}</b>`;
        const subject = `Reset your password to login`

        await sendMail(subject, text, email);
        res.status(200).json({
            success: true,
            message: 'mail sent successfully!'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'server error! ' + error.message
        })
    }
})

app.post('/verifyotp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log('email : ', email);
        console.log('otp : ', otp);
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return (
                res.status(401).json({
                    success: false,
                    message: 'user not registered'
                })
            )
        }
        const verifyOtp = await findUser.verifyOtp(otp)
        console.log('verifyotp : ', verifyOtp);
        console.log('otp : ', otp);
        if (verifyOtp) {
            return res.status(200).json({
                success: true,
                message: 'OTP verified successfully!'
            })
        }
        res.status(400).json({
            success: true,
            message: 'Invalid otp'
        })

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'user not registered!'
        })
    }
})



app.post('/resetpass', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('email : ', email);
        console.log('password : ', password);
        const finduser = await User.findOne({ email });
        if (!finduser) {
            return res.status(401).json({
                success: false,
                message: 'user not registered!'
            })
        }
        const resetPassword = await finduser.verifyPass(password)
        if (!resetPassword) {
            finduser.password = password;
            finduser.save();
            return res.status(200).json({
                success: true,
                message: 'password reset successfull!'
            })
        }
        res.status(400).json({
            success: false,
            message: "password shouldn't be same as the old password!"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'server error!'
        })
    }
})




mongoose.connect(env.DB_URL).then(() => {
    console.log('database connection successfull!');
    app.listen(env.PORT, () => {
        console.log('Server is running on port 8000');
    })
}).catch(() => {
    console.log('database connection unsuccessful!');
})