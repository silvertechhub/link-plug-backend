const Link = require('../model/links');
const mongoose = require('mongoose')



const getAllLinks = async (req, res) => {
    const user_id = req.user._id
    const links = await Link.find({user_id})

   return res.status(200).json(links)
} 

const getSingleLink = async (req, res) => {
    const {id} = req.params 
    
    const singleLink = await Link.findOne({displayName: id})
 
    if(!singleLink){
      return  res.status(404).json({error: "no such plug"})
    }
   return res.status(200).json(singleLink)
}

const postLinks = async (req, res) => {
    const {displayName, userLinks} = req.body
    const user_id = req.user._id  
    try{
        const link = await Link.create({displayName, userLinks, user_id });
        res.status(200).json(link) 
    }catch (error) {
        res.status(400).json({error: error.message})
    } 
        
}

const deleteLinks = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
       return res.status(404).json({error: "no links found"})
    }
    const links = await Link.findOneAndDelete({_id: id})

    if (!links){
        return res.status(404).json({error: "no links found"})
    }

    res.status(200).json(links)
}

module.exports = {
    getSingleLink,
    postLinks, 
    getAllLinks,
    deleteLinks,  
}