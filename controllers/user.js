const userModel=require("../models/user.js")
const bcrypt=require("bcrypt");
const { genrateToken } = require("../utils/genrateToken.js");
const req = require("express/lib/request.js");
const bookingModel = require("../models/booking.js");
const spotModel = require("../models/spot.js");

module.exports.login=async (req,res)=>{

try{
    const {email,password}=req.body;
    const user=await userModel.findOne({
    email:email})
   
    if(!user)
    {
        return res.status(404).json({massege:"user not found"})
    }
bcrypt.compare(password,user.password,function(err, result){
    if(!result)
    {
        return res.status(404).json({massege:"irrect password"})
    }
    const token=genrateToken(user)
res.cookie("token", token);

    res.status(201).json({token});
})

}
catch(err)
{
    res.status(500).json({massege:"server err"});
}
}
module.exports.logOut=async(req,res)=>{
  
    // 1. Completely delete the token cookie from the user's browser
    res.clearCookie("token");
    return;

}
module.exports.register=async(req,res)=>{
    try{
     const {name,email,password,phone}=req.body;
     const hash=await bcrypt.hash(password, 10);
     const user=await userModel.create({
        name,
        email,
        phone,
        password:hash,
     });
       const token=genrateToken(user)
res.cookie("token", token);
     
    return res.status(201).json({massege:"user created"});

    }
    catch(err)
    {
        return res.status(503).json({massege:"user is alredy exist"})
    }
}

module.exports.userHome = async (req, res) => {
    try {
        const activeBookings = await bookingModel.find({
            status: { $in: ["BOOKED", "ACTIVE"] }
        });
        
        const bookedSpotIds = activeBookings.map(booking => booking.spotId);

        // Find spots that are active AND whose ID is NOT IN the booked list
        const availableSpots = await spotModel.find({
            isActive: true, 
            _id: { $nin: bookedSpotIds } 
        });

        res.render("userspot.ejs", { spots: availableSpots });

    } catch (err) {
        // 1. This prints the real error in your terminal so we can see what broke!
        console.error("🔴 ERROR IN USER HOME:", err);
        
        // 2. This sends readable text to the browser instead of {}
        return res.status(503).send("Something broke! Check the terminal for details: " + err.message);
    }
}