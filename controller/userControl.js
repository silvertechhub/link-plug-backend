const { OAuth2Client } = require('google-auth-library')
const mailgun = require("mailgun-js");
const Users = require('../model/users')
const Token = require('../model/token')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const crypto = require('crypto')
const bcrypt = require('bcrypt')


// jwt signup
const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn:'1d'})
}


// google Signup
const  googleClient = new OAuth2Client({
    clientId: `${process.env.GOOGLE_CLIENT_ID}`
})

// mailgun config
const mg = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    })


// login
const userLogin = async (req, res) => {
    const {email, password}  = req.body

    try{
        const user = await Users.login(email, password)
        const token = createToken(user._id)
        res.status(200).json({email, token, id: user._id, username: user.username, phoneNumber: user.phoneNumber })
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// signup
const userSignup = async (req, res) => {
    const {email, password, username, phoneNumber}  = req.body

    try{
        const user = await Users.signup(email, password, username, phoneNumber)
        const token = createToken(user._id)
        res.status(200).json({email, token, username, phoneNumber, id: user._id})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
    
}

// Google Signup/login
const googleAuth = async ( req, res ) => {
    const { token } = req.body;
    try{
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audient: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload();
       
        let user = await Users.findOne({email: payload.email })
        if(!user){
            user = await Users.create({ 
                email: payload.email,
                username:payload.name,
                avatar: payload.picture,
                
            })
            await user.save();
        }
        const googleToken = createToken(user._id)
        res.status(200).json({email:user.email, username:user.username, avatar:user.avatar, phoneNumber: user.phoneNumber, token: googleToken})
    } catch (error) {
        
        res.status(400).json({error: error.message})
    }
}

const forgotPassword = async (req, res) => {
    const {email} = req.body;
    try{
        const user = await Users.findOne({email: new RegExp("^" + email + "$", "i"),});
        if(!user){
            throw Error('this email is not registered a registered user')
        }
        
        let token = await Token.findOne({ userId: user._id });
        if(token){
            await token.deleteOne()
        }
        let resetToken = crypto.randomBytes(32).toString('hex');
        const bcryptSalt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(resetToken, Number(bcryptSalt))

        await new Token({
            userId: user._id,
            token: hash,
            createdAt: Date.now()
        }).save();

        mg.messages().send({
            from: "noreply@linkplug.co",
            to: email,
            subject:"Reset Password",
            html:`<h2>Please click on the link below to reset your password</h2>
                    <p>https://link-plug.herokuapp.com/resetpassword/${resetToken}/${user._id}</p>`
        },(error) => {
            if(error){
                console.log(error)
                res.status(500).send({message:"could not send email, try again later"})
            }else{
                res.send({message: "email sent successfuly"})
            }
        })

    }catch(error){
        console.log(error)
        res.status(400).json({error: error.message})
    }
}

const resetPassword = async (req, res) => {
    const {newPass, resetPassToken, userId} = req.body
    try{
        let passwordResetToken = await Token.findOne({userId})
        if(!passwordResetToken){
            throw Error("Invalid Token ")
        }
        const isValid = bcrypt.compare(resetPassToken, passwordResetToken.token)
        if(!isValid){
            throw Error("Invalid token, please try again")
        }
        const bcryptSalt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPass, Number(bcryptSalt));

        await Users.updateOne(
            {_id: userId},
            {$set: {password: hash}},
            {new: true}   
        )
            await passwordResetToken.deleteOne();
        return res.send("password successfully changed")
    }catch(error) {
        res.status(400).json({error: error.message})
    }
    
    
}

const deleteUser = async (req, res) => {
    const {id} = req.params
    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "this user does not exist"})
     }

     const delUser = await Users.findOneAndDelete({_id: id})

     if (!delUser){
        return res.status(404).json({error: "no user found"})
    }

    res.status(200).json(delUser)
}

const editProfile = async (req, res) => {
    const {id} = req.params
    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "this user does not exist"})
     }

     const updateProfile = await Users.findOneAndUpdate({_id: id}, {
        ...req.body
     })

     if (!updateProfile){
        return res.status(404).json({error: "no user found"})
    }

    res.status(200).json(updateProfile)
}


module.exports = {
    userLogin,
    userSignup,
    googleAuth,
    forgotPassword, 
    resetPassword,
    deleteUser,
    editProfile
}