const spotModel=require("../models/spot.js");

exports.createSpot = async (req, res) => {
    try {
        // 1. Get the data from the user's form
        const { area, landmark, pricePerHr } = req.body;
        const randomLatShift = (Math.random() - 0.5) * 0.1;
        const randomLngShift = (Math.random() - 0.5) * 0.1;

        // 2. MVP MODE: Save it directly to the database! 
        // We removed the map API completely. Every new spot gets a default pin.
        await spotModel.create({
            ownerId: req.userId,
            area: area,
            landmark: landmark,
            pricePerHr: pricePerHr,
            lat: 12.9716+randomLatShift, // Default pin (Center of Bangalore)
            lng: 77.5946+randomLngShift  // Default pin (Center of Bangalore)
        });

        // 3. Send them back to the map page instantly
        
        return res.redirect("/user"); 
        
    } catch (err) {
        console.error("🔴 Error creating spot:", err);
        return res.status(500).send("Server Error: " + err.message);
    }
};


exports.Spots = (req, res) => {
  res.render("spotCreate.ejs")
};

exports.owerSpot=async(req,res)=>{
  try{
  const spots=spotModel.find({ownerId:req.userId})
  res.status(201).json({spots})
  }
  catch(err){
    res.status(400).json("the error is: ",err)
  }
}

exports.update=async(req,res)=>{
  try
  {
  const {isActive}=req.body;
  const spot=spotModel.findById(req.params.id)
  if(!spot)
  {
    return res.status(404).json({massege:"spot not found"})
  }
  if(spot.ownerId.toString() !==req.userId)
  {
    return res.status.json({massege:"you are not allow to update this spot"})
  }
  spot.isActive=isActive;
  await booking.save();

  return res.status(201).json({spot});
  }
  catch(err)
  {
    res.status(400).json("the error is:",err)
  }
}

exports.spotDelete=async(req,res)=>{
  try{
    const spot=spotModel.findById(req.params.id)
     if(spot.ownerId.toString() !==req.userId)
  {
    return res.status.json({massege:"you are not allow to delete this spot"})
  }
   return res.status(201).json({spot});
  }
  catch(err)
  {
    res.status(400).json("the error is:",err)
  }
}

exports.getavelibleSpot=async(req,res)=>{
  try{
     const { area, startTime, endTime } = req.query;
      if (!area || !startTime || !endTime) {
      return res.status(400).json({
        message: "area, startTime and endTime are required"
      });
    }
     const spots = await spotModel.find({
      area,
      isActive: true
    });

    if (spots.length === 0) {
      return res.json([]);
    }
const conflictingBookings = await bookingModel.find({
      spotId: { $in: spots.map(s => s._id) },
      status: { $ne: "CANCELLED" },
      startTime: { $lt: new Date(endTime) },
      endTime: { $gt: new Date(startTime) }
    }).select("spotId");

    // 3️⃣ Exclude booked spots
    const bookedSpotIds = conflictingBookings.map(b => b.spotId.toString());

    const availableSpots = spots.filter(
      spot => !bookedSpotIds.includes(spot._id.toString())
    );

    res.json(availableSpots);


}
  catch(err){
  res.status(500).json({ error: err.message });
  }
}