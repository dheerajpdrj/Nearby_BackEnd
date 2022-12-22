const mongoose = require('mongoose');


const connectDB = async ()=>{
    try {
       const conn = await mongoose.connect(process.env.DATABASE_URL)
       console.log("DataBase connected successfully");
    } catch (error) {
        console.log(`Error while connecting DataBase`, error);
    }
}


module.exports= connectDB;