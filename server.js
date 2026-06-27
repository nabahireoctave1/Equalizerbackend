require('dotenv').config()
const express=require('express')

const cors= require('cors')
const { Server } = require("socket.io");
const http= require('http')
 const Routes= require('./routes/routes')
 const helmet= require('helmet')
 const jwt=require('jsonwebtoken')


 const {StartWhattApp,getWhatsappStatus}= require('./otherController/WhattappController');
const app = express()

app.use(helmet())

app.use(cors({
  origin:"http://localhost:5173"
}


))

app.use(express.json())
app.use('/',Routes)



const server= http.createServer(app)

const io= new Server(server,{
    cors:{
       origin:"http://localhost:5173"
    }
})


StartWhattApp(io)

io.use((socket,next)=>{
  try{

  const token=socket.handshake.query.token;
  if(!token){
    throw new Error('unuathorized')
  }

  const user= jwt.verify(token,process.env.JWT_SEC)
  socket.user=user;
   next();
  }
  catch(err){
    console.log('ivalid token')
  }
})
const activeuser=new Set();

io.on("connection", (socket) => {

const {id,role}= socket.user;

activeuser.add(id)
console.log(activeuser.size)
  if(role==='superadmin'){
  socket.join('super_admin_room');
   const currentstatus=getWhatsappStatus();
  socket.emit('whatsapp_gateway_status',currentstatus)

  }
  if(role==='subadmin'){
    socket.join('subadmin_room')
    socket.join(`admin_${id}`)
  }

  if(role==='cashier')
  {
    socket.join(`cashier_room_${id}`)
  }
  
 


  socket.on("disconnect", () => {
    activeuser.delete(id)
    console.log(activeuser.size)

  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});

