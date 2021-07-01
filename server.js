const express = require('express'),
dotenv = require('dotenv'),
morgan = require('morgan'),
colors = require('colors');
//files
const bootcamps = require('./routes/bootcamps');
//db
const connectDB = require('./config/db');
//configs
dotenv.config({path: './config/config.env'});
connectDB();
const app = express();



//dev logging middleware //only during development mode
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//mount routers
app.use('/api/v1/bootcamps', bootcamps);





const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server Running in ${process.env.NODE_ENV} mode, on Port ${PORT}`.underline.bgMagenta));

//Handeling the unhandled promise rejection
process.on('unhandledRejection',(err, promise)=>{
    console.log(`ERROR: ${err.message}`.red.bold);
    //close server & exit process
    server.close(()=> process.exit(1));
})