const mongoose = require('mongoose');

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[ true, 'Please add a name'],
        unique:true,
        trim:true,
        maxlength:[50, 'Name Cannot be more than 50 charcahters']
    },
    slug : String,
    description:{
        type: String,
        required:[ true, 'Please add a description'],
        maxlength:[500, 'Description Cannot be more than 50 charcahters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone:{
        type:Number,
        maxlength: [ 20, 'Phone number cannot be more than 20 digits']
    },
    email:{
        type:String,
        match: [
           /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
           'Please add a valid email'
        ]   
    },
    address:{
        type:String,
        required: [ true, 'Please add an address']
    },
    location: {
        // GeoJSON Point
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true,
          index: '2dsphere'
        },
        formattedAddress: String,
        city: String,
        country: String,
        street: String,
        zipcode: String

    },
    careers:{
        type: [String],
        required:true,
        enum:[
            'Web Developemnt',
            'Mobile Developemnt',
            'UI/UX',
            'Game Developemnt',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating:{
        type:Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating cannot be more than 10']
    },
    averageCost:Number,
    photo:{
        type:String,
        default: 'no-photo.jpg'
    },
    housing:{
        type:Boolean,
        default:false
    },
    jobAssistance:{
        type:Boolean,
        default:false
    },
    jobGuarantee:{
        type:Boolean,
        default:false
    },
    acceptGi:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const Bootcamp = mongoose.model('Bootcamps', BootcampSchema);
module.exports = Bootcamp;