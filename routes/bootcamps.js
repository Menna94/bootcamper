const express = require('express'),
router = express.Router();
const {
    getAllBootcamps,
    getBootcamp,
    createBootcamp, 
    deleteBootcamp,
    updateBootcamp
} = require('../controllers/bootcamps');

//Get all bootcamps
//GET /api/v1/bootcamps
router.get('/',getAllBootcamps)
//Get single bootcamp

//GET /api/v1/bootcamps/:id
router.get('/:id',getBootcamp)

//Create a new bootcamp
//POST /api/v1/bootcamps/
router.post('/',createBootcamp)

//Update a bootcamp
//PUT /api/v1/bootcamps/:id
router.put('/:id',updateBootcamp)

//Delete a bootcamp
//DELETE /api/v1/bootcamps/:id
router.delete('/:id', deleteBootcamp)

module.exports = router;