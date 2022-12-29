const express = require('express')
const {
    userLogin, userSignup, googleAuth, forgotPassword, deleteUser, editProfile, resetPassword
    } = require('../controller/userControl')
const requireAuth = require('../middleware/requireAuth')

const Router = express.Router()

// login 
Router.post('/login', userLogin ) 

// signup
Router.post('/signup', userSignup )

// google login
Router.post('/googleLogin', googleAuth)

// forgot password
Router.post('/forgotpassword', forgotPassword)

// reset password
Router.post('/resetpassword', resetPassword)

// delete user
Router.delete('/:id', requireAuth, deleteUser)

// update profile
Router.patch('/:id', requireAuth, editProfile)

module.exports = Router