import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "../app";
import { Chat } from "../models/chatModel";


 const server = createServer(app)
 
const io = new Server(server, {
    cors: {
        origin: process.env.frontEnd_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
})
io.on('connection', (socket) => {
    console.log('server connected', socket.id)
    socket.on('joinRoom',async ({ roomId }) => {
        socket.join(roomId)
        console.log(`User with ID ${socket.id} joined room ${roomId}`);

        const chat = await Chat.findOne({ roomId })
        
        if (chat) {
            server.emit('loadMessages',chat)
        }
        
    })

    socket.on('loadMessages', (roomId) => {
        return Chat.find({roomId})
    })

    socket.on('message',async (messageData) => {
        const { roomId, sender, content } = messageData
        const message = { sender, content, time: new Date() }
        
        await Chat.findOneAndUpdate(
            { roomId },
            { $push: { messages: message } },
            {upsert:true,new:true}
        )

        io.to(roomId).emit('message',message)
    })

    
    
    socket.on('disconnection',()=> {
        console.log('disconnected:-',socket.id); 
    })
})

 
export default server