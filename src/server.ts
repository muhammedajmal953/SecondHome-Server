import connectDB from "./db";
import server from "./utils/sockeIO";


connectDB()

server.listen(process.env.PORT, () => {
    console.log('server is running on 5000');
    
})