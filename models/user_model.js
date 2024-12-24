const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    forgetPassword: {
        type: String,
        default: 'xyz'
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return next();
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});

userSchema.methods.getToken = async function () {
    return jwt.sign({ email: this.email, id: this._id }, process.env.SECRET_KEY, {
        expiresIn: '3d'
    });
}

userSchema.methods.generateOtp = async function () {
    this.forgetPassword = Math.ceil(10000 + Math.random() * 999999);
    return this.forgetPassword
}

userSchema.methods.verifyPass = async function (enteredPassword) {
    return bcryptjs.compare(enteredPassword, this.password);    //bcryptjs.compare(enteredPassword, this.password)
}

userSchema.methods.verifyOtp = async function (enteredOtp) {
    return parseInt(this.forgetPassword) === parseInt(enteredOtp);
}

const User = mongoose.model('User', userSchema);

module.exports = User