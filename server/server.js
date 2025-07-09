import express from "express";
import "dotenv/config"
import cors from "cors"
import http from "http"
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/user.route.js";
import messageRouter from "./routes/message.route.js";
import {Server } from "socket.io"


const app = express();
const server = http.createServer(app)

//socket server
export const io = new Server(server,{
    cors:{origin:"*"}
})

//store user
export const userSocketMap ={};

//socket connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User connected ",userId)

    if(userId)userSocketMap[userId]=socket.id;

    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

app.use(express.json({
    limit: "4mb"
}))
app.use(cors());

//Route setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);

//connecting mongodb
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on PORT:" + PORT));