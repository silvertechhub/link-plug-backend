const {Schema , model} = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')



const authSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        
    },
    username:{
        type: String,
        required: true
    },
    phoneNumber:{
        type: String,
        
    },
    avatar:{
        type: String,
        default: ''
    }
},{timestamps:true})

// static signup method

authSchema.statics.signup = async function (email, password, username, phoneNumber) {
    // validate
    if(!email && !password ) {
        throw Error('Blank fields? really?? Put in your details MF')
    }
    if(email && !password){
        throw Error('So you just wanna signup with only an email')
    }
    if (!validator.isEmail(email)){
        throw Error('Nigga just put in a valid email ffs')
    }

    const exist = await this.findOne({email: new RegExp("^" + email + "$", "i"),});

    if(exist) {
        throw Error('this email is already in use ')
    }

    const bcryptSalt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, bcryptSalt)

    const user = await this.create({email, password: hash, username, phoneNumber})

    return user
}

// login static method
authSchema.statics.login = async function (email, password) {
    if(!email){
        throw Error('dont stress me man, put in your email')
    }
    const loginUser  = await this.findOne({email: new RegExp("^" + email + "$", "i"),});

    if(!loginUser) {
        throw Error(`Nigga, I can't find this user, go signUp first or check that your email is correct `)
    }
    const match = await bcrypt.compare(password, loginUser.password)

    if(!match){
        throw Error('Recheck your password bruh')
    }
    
    return loginUser
}  


const Users = model('auth', authSchema)

module.exports = Users