
require('dotenv').config()
const conn = require('../mysql_connection/conn');
const con= require('../mysql_connection/conn')
const crypto= require('crypto')
const {SendWhattappmessage}=require('./WhattappController')

const bcrypt= require('bcrypt')
const jwt= require('jsonwebtoken')
 

async function generateId(conn) {
  while (true) {
    const id = crypto.randomInt(100000,1000000);
     
    const [rows] = await conn.execute(
      'SELECT company_id FROM company WHERE company_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return id; 
    }
  }
}



const Company_Registration = async (req, res) => {
  const  {
    companyNames,
    adminNames,
    adminPhone,
    adminNid,
    companyLocation,
    adminEmail,
    permissionId,
  }=req.body;





  let conn;

  try {
    conn = await con.getConnection();

    const compid= await generateId(conn)
    const userid= await generateId(conn)
    const securitytoken=crypto.randomBytes(4).toString('hex')
    const hashedtoken= crypto.createHash('sha256').update(securitytoken).digest('hex')
    let cryptolink= `http://localhost:5173/security-setting/${securitytoken}`
    

    await conn.beginTransaction();


    const [isexist]=await conn.execute('SELECT company_id FROM  company WHERE company_name=?',
      [companyNames])

      if(isexist.length==1){
        await conn.rollback()
        return res.status(400).json({success:false,message:"Company already exist"})
      }  
      
       const [isadminexist]=await conn.execute('SELECT company_id FROM  company WHERE admin_name=?',[adminNames] )
      
    if(isadminexist.length==1){
      await conn.rollback()
      return res.status(400).json({success:false,message:"admin already registered to other company"})
    }
       const [adminid]=await conn.execute('SELECT company_id FROM  company WHERE admin_id=?',
      [adminNid])
       if(adminid.length==1){
        await conn.rollback()
        return res.status(400).json({success:false,message:"National id must be unique"})
      }  
   const [phone]=await conn.execute('SELECT company_id FROM  company WHERE phone=?',
      [adminPhone])
       if(phone.length==1){
        await conn.rollback()
        return res.status(400).json({success:false,message:"Phone number  must be unique"})
      }  
    

    const [result] = await conn.execute(
      `INSERT INTO company(company_id,admin_sys_Id, agent_id, 
      company_name,admin_name,phone, admin_id, location) VALUES (?,?,?,?,?,?,?,?)`,
      [
        compid,
        userid,
        permissionId,
        companyNames,
        adminNames,
        adminPhone,
        adminNid,
        companyLocation,
      ]
    );


    if (result.affectedRows === 1) {
          
      const [verifyuserphone]= await conn.execute('SELECT* FROM users WHERE phone=?',[adminPhone])
      if(verifyuserphone.length==1){
        await conn.rollback();
        return res.status(400).json({success:false,message:"Phone number  must be unique"})

      }

      const [user]=await conn.execute(`INSERT INTO users(user_id,company_id,names, email,phone,
         role, password, is_password_set) VALUES (?,?,?,?,?,?,?,'0')`,[
          userid,compid,adminNames,adminEmail,adminPhone,'subadmin',null
         ] )    
         const insertId= user.insertId;

         const [savelinktoken]= await conn.execute(`INSERT INTO linktoken(userid,token,isused,expiration)
           VALUES(?,?,?,NOW()+INTERVAL 15 MINUTE)`,[insertId,hashedtoken,'0'])
      await conn.commit();
          
           console.log(cryptolink)
       if(savelinktoken.affectedRows===1){
        const messagetext=`*HELLO EQUALIZER MEMBER*, 
     *${adminNames.trim()}*
      Click Link bellow to set your Company ${companyNames} password securely
      ${cryptolink} `
      SendWhattappmessage(adminPhone,messagetext,adminEmail)
       return res.status(200).json({
        success:true,
        message:
          "Company registration successfully, security link have been sent on email or whatsapp verify one of them",
      });
       }
         
      
    } else {
      await conn.rollback();
      return res.json({success:false, message: "registration failed try again" });
    }
  } catch (err) {
    if (conn) await conn.rollback();
    console.log(err.message)
    return res.status(500).json({ success:false, message:'registration failed try again' });
  }finally{
   if(conn)  await conn.release()
  }
};



const Login = async (req,res)=>{
  
  const {phone,password}=req.body;

  let conn;
  try{

 conn=await con.getConnection();

 await conn.beginTransaction();

 const [result]=await conn.execute('SELECT * FROM users WHERE phone=?',[phone]) 
  if(result.length===0){
    await conn.rollback()
  return res.status(401).json({success:false ,message:`Access denied check your credentials!`})
 }

 if(result.length===1){

 const status= result[0].status
 const name= result[0].name;
 if(status==='inactive'){
  await conn.rollback()
  return res.status(401).json( {success:false, message:`Dear ${name}  your account have been locked please contact support for assistance`})
 }

 const user= result[0]

  if(user.password==null||undefined){
    await conn.rollback()
    return res.status(400).json({message:'Password configuration required !'})
 }

const isvalid= await bcrypt.compare(password,user.password)
if(isvalid){
   const token= jwt.sign({id:user.user_id,compId:user.company_id,role:user.role,phone:user.phone},process.env.JWT_SEC ,{expiresIn:'1d'})
  
   if(token){
   return res.status(201).json({success:true,message:"Authentication success",tkn:token})

   }
}
else{
  await conn.rollback();
  return res.status(401).json({success:false,message:"Access denied check your credentials!"})
}

 }




  await conn.commit()


  }
  catch(err){
    if(conn)await conn.rollback();
      console.log('error in login controller',err.message)
    return res.status(500).json({success:false,message:'Login failed try again'})

  }finally{
    if(conn) await conn.release()

  }
}


const PasswordSetting=async(req,res)=>{
  const {password,confirmpassword,tkn}=req.body;
  console.log(tkn)
  
  let conn;
  try{
  if(password!==confirmpassword){
    return res.status(400).json({success:false,message:'Password don`t match try again!'})
  }
conn= await con.getConnection()
await conn.beginTransaction();
const salt=await bcrypt.genSalt(8)
const hashedpassword=await bcrypt.hash(password,salt);
const hashedtoken= crypto.createHash('sha256').update(tkn).digest('hex')

const [vlink]= await conn.execute('SELECT * FROM `linktoken` WHERE Token=? AND isused=?',[hashedtoken,'0'])
if(vlink.length===0){
  await conn.rollback()
  return res.status(401).json({success:false,message:"Unauthorized Link"})
}

 if(new Date(vlink[0].expiration)<new Date()){
  await conn.rollback();
  return res.status(401).json('Link had been expired')
 }
const userid= vlink[0].userid
console.log(vlink[0].Token,hashedtoken)

 const [savepws]= await conn.execute(`UPDATE users SET password=?,
   is_password_set='1' WHERE user_id=?`,[hashedpassword,userid])
   
   if(savepws.affectedRows===1){
    await conn.execute('UPDATE linktoken SET isused="1" WHERE Token=?',[hashedtoken]);
   await conn.commit();

    return res.status(200).json({success:true,message:"Password successfully saved"})
   
   }
    else{
      await conn.rollback()
       return res.status(400).json({success:false,message:"Failed try again!"})
    }
  

  }
  catch(err){
   if(conn) await conn.rollback()
  }
  finally{
   if(conn)  await conn.release();
  }
}





const emitMessageTouserinGroup=async (io,room,event,message)=>{
  const sockets= await io.in(room).fetchSockets();
  for( let socket of sockets){
    socket.emit(event,{message:message});
  }
}

module.exports ={
    Company_Registration,
    Login,PasswordSetting,
   emitMessageTouserinGroup
}