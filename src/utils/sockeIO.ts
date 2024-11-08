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

    socket.on('loadMessages', async (roomId) => {
        try {
            const chat = await Chat.findOne({ roomId });
            if (chat) {
                socket.emit('loadMessages', chat); 
            } else {
                socket.emit('loadMessages', []); 
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            socket.emit('error', 'Failed to load messages');
        }
    });

    socket.on('message', async (messageData) => {
        
        const { sender, content, userId, vendorId } = messageData
        console.log(content);
        
        let {roomId}=messageData
        const message = { sender, content, time: new Date() }
        
        if (!roomId) {
            roomId=`${userId}-${vendorId}`
        }
        console.log('vendor id',vendorId);
        console.log('userid id',userId);
        await Chat.findOneAndUpdate(
            { roomId , userId, vendorId},
            {
                $setOnInsert: { roomId, userId, vendorId },
                
                $push: { messages: message }
            },
            {upsert:true,new:true}
        ) 

        io.to(roomId).emit('message',message)
    })

    socket.on('rooms', (details:{id:string,role:string}) => {
        if (details.role === 'user') {
            return Chat.find({userId:details.id})
        }
        console.log('id in all rooms',details.id);
        
        return Chat.find({vendorId:details.id})
    })
    
    socket.on('disconnection',()=> {
        console.log('disconnected:-',socket.id); 
    })

   

})

 
export default server