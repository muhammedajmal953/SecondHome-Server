import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "../app";
import { Chat } from "../models/chatModel";
import User from "../models/userModel";


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
    socket.on('joinRoom', async ({ roomId }) => {
        try {
            socket.join(roomId);
            console.log(`User with ID ${socket.id} joined room ${roomId}`);

            const chat = await Chat.findOne({ roomId });
            const ids = roomId.split('-')
            const vendor = await User.findOne({ _id: chat?.vendorId });
            if (!chat) {
                
                console.log(`No existing chat for room ${roomId}. Creating a new room.`);
                const newChat = new Chat({ roomId,userId:ids[0],vendorId:ids[1], messages: [] });
                await newChat.save();
                
                socket.emit('loadMessages', { chat: newChat, vendor });
            } else {
                socket.emit('loadMessages', { chat, vendor });
            }
        } catch (error) {
            console.error(`Error handling room join for room ${roomId}:`, error);
            socket.emit('error', 'Failed to join the room');
        }
    });
    socket.on('loadMessages', async (roomId) => {
        try {
            const chat = await Chat.findOne({ roomId })
            const vendor=await User.findOne({_id:chat?.vendorId})
            if (chat) {
                socket.emit('loadMessages', {chat,vendor}); 
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

    socket.on('rooms', async (details: { id: string, role: string }) => {
        let rooms;
        if (details.role === 'user') {
            rooms = await Chat.find({ userId: details.id });
        } else {
            console.log('role in all rooms', details.role);
            // rooms = await Chat.find({ vendorId: details.id });
            rooms = await Chat.aggregate([
                {
                    $match:{vendorId: details.id }
                }, {
                    $addFields:{userId:{$toObjectId:"$userId"}}
                }
                , {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as:'user'
                    }
                }
            ])
        }
        
        console.log('Rooms data:', rooms);
        socket.emit('rooms', rooms);
    });
    
    
    socket.on('disconnection',()=> {
        console.log('disconnected:-',socket.id); 
    })

   

})

 
export default server