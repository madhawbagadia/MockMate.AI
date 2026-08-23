import User from "../models/user.js";

const getCurrentUser = async (req,res)=>{

    try{
        const userId = req.userId;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        return res.status(200).json(user);
    }
    catch(err){
        return res.status(500).json({message:`failed to get current-user ${err}`});
    }
}

export default getCurrentUser;