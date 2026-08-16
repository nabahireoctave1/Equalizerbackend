require('dotenv').config()
const express=require('express')

const cors= require('cors')
const { Server } = require("socket.io");
const http= require('http')
 const Routes= require('./routes/routes')
 const helmet= require('helmet')
 const jwt=require('jsonwebtoken')
 const morgan=require('morgan');


 const {StartWhattApp,getWhatsappStatus}= require('./otherController/WhattappController');
 let {getonlineuser,sendManualyNotification,HandlesendTo}= require('./MainController/Controllers');
const path = require('path');

const app = express()


app.use(cors({
  origin:"http://localhost:5173"

}
))
app.use(helmet({
crossOriginResourcePolicy:{
  policy:"cross-origin"
}
}))

app.use(morgan('dev'))
app.use(express.json())
app.use('/',Routes)

app.use('/uploads',express.static(path.join(__dirname,'uploads')))


const server= http.createServer(app)

const io= new Server(server,{
    cors:{
       origin:"http://localhost:5173"
    }
})


StartWhattApp(io)

io.use((socket, next) => {
  try {
    const token = socket.handshake.query.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const user = jwt.verify(token, process.env.JWT_SEC);
    socket.user = user;

    next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
});
const activeuser=new Set();


io.on("connection", (socket) => {

const {id,role,compId}= socket.user;
HandlesendTo(socket);

sendManualyNotification(io,socket);
activeuser.add(id);
console.log(activeuser.size,'online')
getonlineuser(activeuser.size);
  if(role==='superadmin'){
  socket.join('super_admin_room');
   const currentstatus=getWhatsappStatus();
  socket.emit('whatsapp_gateway_status',currentstatus)

  }
  if(role==='subadmin'){
    socket.join(`admin_${compId}`)
    socket.join(`private_admin_${id}`)
  }

  if(role==='cashier')
  {
    socket.join(`cashier_${id}`)
  }
  

 


  socket.on("disconnect", () => {
    activeuser.delete(id);
    getonlineuser(activeuser.size)
    console.log(activeuser.size,'online')

  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});


