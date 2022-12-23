const express = require ('express');
const cors = require('cors');
const userRouter = require ('./routes/user');
const postrouter = require ('./routes/post');
const uploadRouter = require ('./routes/upload');
const reactRouter = require('./routes/react');
const chatRouter = require ('./routes/chat');
const messageRouter = require ('./routes/message');
const dotenv = require('dotenv').config();
const {errorHandler}=  require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');


connectDB();
const app = express();


const options = {
    origin:"https://main.d3jea3bkis5evb.amplifyapp.com",
    optionSuccessStatus: 200
}

app.use(express.json());
app.use(cors(options));
app.use(fileUpload({
    useTempFiles:true
}))

 



app.use('/', userRouter);
app.use('/',postrouter);
app.use('/',uploadRouter);
app.use('/',reactRouter);
app.use('/chat',chatRouter);
app.use('/message',messageRouter);
// readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

app.use(errorHandler)


const PORT= process.env.PORT || 8000;

app.listen(PORT,()=>{
    console.log(`Sever is running on port ${PORT}`)
})