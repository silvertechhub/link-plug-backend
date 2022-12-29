const jwt = require('jsonwebtoken')
const auth = require('../model/users')

const requireAuth = async (req, res, next) => {
    
    const { authorization } = req.headers

    if(!authorization){
        return res.status(401).json({error: "authorization token required"})
    }

    const token = authorization.split(" ")[1] 
    try{
        const {_id} = jwt.verify(token, process.env.SECRET)

        req.user = await auth.findOne({_id}).select('_id')
        next()
    }catch (error) {
        console.log(error)
        res.status(401).json({error: 'invalid token'})
    }
   

}

module.exports = requireAuth