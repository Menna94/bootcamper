const mongoose = require('mongoose')
const connectDB = async() =>{
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        useUnifiedTopology:true,
        useNewUrlParser:true,
        useFindAndModify:false,
        useCreateIndex:true
    });

    console.log(`DB Connected: ${conn.connection.host}`.magenta.bold);
}

module.exports = connectDB;