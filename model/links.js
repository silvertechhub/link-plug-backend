const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const userSchema = new Schema({
   displayName: {
      type: String,
      required: true
   },
   userLinks:[
    
   ],
   user_id : {
      type:String,
      required: true
   }
}, {timestamps:true}) 

module.exports = mongoose.model('link', userSchema)