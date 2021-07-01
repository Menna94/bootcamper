//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   public
exports.getAllBootcamps = (req,res,next)=>{
    res.status(200).send({success: true, msg:'Show All Bootcamps!',hello:req.hello})

}



//@desc     Get single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   public
exports.getBootcamp = (req,res,next)=>{
    res.status(200).send({success: true, msg:`Display Bootcamp ${req.params.id} !`})
}



//@desc     Create a new bootcamp
//@route    POST /api/v1/bootcamps/
//@access   private
exports.createBootcamp = (req,res,next)=>{
    res.status(200).send({success: true, msg:'Create a new Bootcamp!'})
}



//@desc     Update a bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   private
exports.updateBootcamp = (req,res,next)=>{
    res.status(200).send({success: true, msg:`Update a Bootcamp ${req.params.id} !`})
}



//@desc     Delete a bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   private
exports.deleteBootcamp = (req,res,next)=>{
    res.status(200).send({success: true, msg:`Delete a Bootcamp ${req.params.id} !`})
}