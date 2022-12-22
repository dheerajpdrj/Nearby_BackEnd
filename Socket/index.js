const io = require('socket.io')(8800, {
    cors: {
        origin: "http://localhost:3000"
    }
})

let activeUsers = [];

io.on('connection', (socket) => {
    console.log("a user connected",socket.id);
    
    // add new user;
    socket.on("new-user-add", (newUserId) => {
        
        console.log("a user added",newUserId);
        //if user is not added previously
        if (!activeUsers.some((user) => user.userId === newUserId)) {
            activeUsers.push({
                userId: newUserId,
                socketId: socket.id
            })
        }
        // console.log("Connected Successfully", activeUsers);
        io.emit('get-users', activeUsers);
    })

    //send and get message
    socket.on("send-message", (data)=>{
        const {receiverId} = data;
        const user = activeUsers.find((user)=> user.userId === receiverId)
        //console.log("Sending from socket to :", receiverId);
        
        console.log("userid",activeUsers);
        console.log("user",user);
        if(user){
            console.log("Data", data.text);
            io.to(user.socketId).emit("receive-message", data);
        }
    })


    // when user diconnected
    socket.on("disconnect", ()=>{
        activeUsers = activeUsers.filter((user)=> user.socketId !== socket.id );
        console.log("User Disconnected", activeUsers)
        io.emit('get-users',activeUsers);
    })
})