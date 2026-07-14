require('dotenv').config();
const con = require('../mysql_connection/conn');
 let {emitMessageTouserinGroup}=require('../otherController/controller')
 const crypto= require('crypto')
const {decodeResponse}=require('../HtmlCHars')



let counter = 0;

const getonlineuser = (online) => {
    counter = online;
};

async function generateId(conn) {
  while (true) {
    const id = crypto.randomInt(100000,1000000);
     
    const [rows] = await conn.execute(
      'SELECT agent_id FROM agent WHERE agent_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return id; 
    }
  }
}

const OverviewDash = async (req, res) => {
    try {
        
        const [result] = await con.execute(`SELECT 
            (SELECT COUNT(*) FROM users) AS totalUsers,
            (SELECT COUNT(*) FROM company) AS totalCompanies,
            (SELECT COUNT(*) FROM company WHERE status = 'overdue') AS overdueCompanies,
            (SELECT COALESCE(SUM(amount), 0) FROM billing) AS totalRevenue,
            (SELECT COALESCE(SUM(amount), 0) 
             FROM billing 
             WHERE MONTH(started_date) = MONTH(CURDATE()) 
               AND YEAR(started_date) = YEAR(CURDATE())
            ) AS monthlyPayment;`);


        if (result.length === 1) {
            let data = result[0]; 
            
            data.activeUsers = counter; 

            return res.status(200).json(data);
        }

    } catch (err) {
       

        console.log('err in overview dash controller', err.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};




const Transaction= async(req,res)=>{
    try{
        const [result]=await con.execute(`SELECT 
t.transcation_id, 
t.company_id, t.amount, t.transcation_date,
t.status, t.created_at,cp.company_name
FROM transcation_log t
INNER JOIN company
as cp ON t.company_id=cp.company_id ORDER BY t.transcation_date DESC`)  
         
        if(result.length!==0){
           return res.status(200).json(result)
        }


        return res.status(404).json({message:'Transaction not available'})
    
    }
    catch(err){
      console.log('error in transaction controller',err.message)
              
} 
    
}



const cashier= async (req,res)=>{
    try{
        const [result]=await con.execute('SELECT*FROM cashier')
        if(result.length!==0){
            return res.status(200).json(result)
        }
        return res.status(404).json({message:"cashier not available"})
    }
    catch(err){
        console.log('error in cashier controller',err.message)
    }

} 


const CompanyAdmin_info= async(req,res)=>{
    try{
            const [result]= await con.execute(`SELECT company_name ,admin_name, admin_id,phone,
                status, created_at  FROM company`)
        if(result.length!==0){
            return res.status(200).json(result)
        }
        return res.status(404).json({message:'Not found'});
    }
    catch(err){
        console.log('error in company admin controller',err.message)
    }

}


const sendManualyNotification= async(io,socket)=>{
    let conn;

    try{
    conn= await con.getConnection();
    await conn.beginTransaction();
    socket.on('send-notification-to-all',async(data)=>{
        const notif= data;
        
    
       let [company] = await conn.execute(`SELECT company_id FROM company`);
     
       for  (let comp of company){
        let companyId=comp.company_id
         
        const [savenotif]= await con.execute(`INSERT INTO notification(company_id, notification) VALUES (?,?)`,[companyId,notif])

        await emitMessageTouserinGroup(
            io,
            `admin_${companyId}`,
            'receive-manualynotif',
            notif

        )
       
       }
       await conn.commit();
    })
    }catch(err){
        if(conn) await conn.rollback();
        console.log('Error in send manually notif controller',err.message)
    } 
    finally{
        if(conn) (await conn).release();
    }

}



const saveSpadminsetting= async(req,res)=>{
    let {reminder,overdue,lockafter,graceperiod,interest,agentreward}=  req.body;
    
    
    let conn;
    try{
    conn= await con.getConnection();
     await conn.beginTransaction()

     const [isexist]=await conn.execute('SELECT * FROM super_setting');

     if(isexist.length===0){
     const [isnotifsettingexist]=await conn.execute('SELECT* FROM super_admin_auto_notification')
     if(isnotifsettingexist.length==0){
        const [saveautonotif]=await conn.execute('INSERT INTO super_admin_auto_notification(reminder,overdue) VALUES(?,?)',[reminder,overdue]);
        if(saveautonotif.affectedRows==1){
            await conn.execute(`INSERT INTO super_setting(id, interest_percentage_ration, grace_period, lock_after_days,
                 agent_amount) VALUES (null,?,?,?,?)`,[interest,graceperiod,lockafter,agentreward]);
        }
     }
     }
     else{
     const [updtnotif]= await conn.execute('UPDATE super_admin_auto_notification SET reminder=?, overdue=?,updated_at=NOW()',[reminder,overdue])
      if(updtnotif.affectedRows==1){
        await conn.execute(`UPDATE super_setting SET interest_percentage_ration=?,grace_period=?,
            lock_after_days=?,updated_at=NOW(),agent_amount=?`,[interest,graceperiod,lockafter,agentreward])
      
      }
      }
     await conn.commit();
     return res.status(200).json({success:true,message:"successfully setting saved"})
    }catch(err){
    if(conn) await conn.rollback();
    return res.status(500).json({success:false,message:'failed to save settings'})
    }finally{
     if(conn) await conn.release();
    }

}



const ReturnCurrentSetting= async(req,res)=>{
    try{
      const [result]= await con.execute(`SELECT
    s.interest_percentage_ration,
    s.grace_period,
    s.lock_after_days,
    s.agent_amount,
    spautonotif.reminder,
    spautonotif.overdue
   FROM super_setting AS s
   CROSS JOIN super_admin_auto_notification AS spautonotif`)


    let data= result[0];
    let success=true;
    data.success=success;
    
    return res.status(200).json(decodeResponse(data))
    }

    catch(err){
        return res.status(500).json({success:false,message:"Failed to Return current setting try again"})
    }
}



const GetCompanyAdmin= async(req,res)=>{

    try{
     let [result]= await con.execute('SELECT company_id,admin_name,company_name FROM company');
     if(result.length!==0){
        return res.status(200).json(decodeResponse(result));
     }

    }
    catch(err){
        console.log('error in Getcompany admin controller',err.message);
    }
}



const HandlesendTo= async(socket)=>{
    
   socket.on("send-to-company", async (data) => {
  let conn;

  try {
    conn = await con.getConnection();
    await conn.beginTransaction();

    const { companyid, notification } = data;

    const [result] = await conn.execute(
      "INSERT INTO notification(company_id, notification) VALUES (?, ?)",
      [companyid, notification]

    );

       const targetroom=`admin_${companyid}`
      await socket.join(targetroom)
     socket.to(targetroom).emit("receive-company-notif", {
        notif: notification,
      })

      await socket.leave(targetroom)

    await conn.commit();

  } 
  catch (err) {
    if (conn) await conn.rollback();
    console.log('Error in handleSendto controller',err.message);
  } finally {
    if (conn) conn.release();
  }
});
}


const HandleReturnAdminList= async(req,res)=>{
    try{
    
        const [result]=await con.execute(`SELECT cp.company_id,
            cp.admin_sys_Id, cp.company_name,
             cp.admin_name, cp.phone, cp.admin_id, 
            cp.location, cp.status,u.email,u.role FROM
             company as cp LEFT JOIN users 
             as u ON cp.admin_sys_Id=u.user_id`);

             if(result.length===0){
                return res.status(404).json({message:'No admin information found'});

             }

        return res.status(200).json(decodeResponse(result));  
}
    catch(err){
        console.log('Error in HandleReturnAdminList controller ',err.message)
    }
}



const HandlesaveAgent= async(req,res)=>{

    const {names,phone,email,location}=req.body;
     let conn;
     
     try{
        conn=await con.getConnection();
        await conn.beginTransaction();
        const Id=await generateId(conn);
        
        const [isexist]= await conn.execute('SELECT agent_id FROM agent WHERE email=?',[email])
        if(isexist.length===1){
            await conn.rollback();
            return res.status(400).json({success:false,message:"Email already exist try again!"})
        }
        else{
         const [isphoneexist]=await conn.execute('SELECT agent_id FROM agent WHERE phone=?',[phone])
         if(isphoneexist.length===1){
            await conn.rollback();
            return res.status(400).json({success:false,message:"Phone number already exist try again!"})
         }
        }


      const [result]= await conn.execute(`INSERT INTO agent(agent_id,permision_id, name,
         email, location, phone) VALUES (?,?,?,?,?,?)`,[Id,Id,names,email,location,phone]);
        await conn.commit()

        if(result.affectedRows===1){
            return res.status(200).json({success:true,message:"Operation successfully agent saved"})
        }
        


     }
     catch(err){
        if(conn){await conn.rollback();}
        console.log('Error in save agent controller',err.message)
        return res.status(500).json({success:false,message:"Failed to save agent!"})
     } finally{
        if(conn) {await conn.release()}
     }
}



const LogAgent=async(req,res)=>{
    try{
    const [result]= await con.execute('SELECT * FROM `agent`')
    if(result.length!==0){
        return res.status(200).json(decodeResponse(result));

    }
    return res.status(404).json({message:"Agent information not found"})

    
    }
    catch(err){
     return res.status(500).json({message:"server error try again"})
    }
}



const CompanyCurrentSetting= async (req,res)=>{
    const {compId}=req.user;
    if(!compId){
        return res.status(403).json({success:false,message:'Unknown company'})
    }
      try{
      const [result]=await con.execute(`SELECT s.disable_loan_app, s.report_generetion_time, s.interest_percentage, s.payment_frequency, s.grace_period ,cp_auto_notif.reminder,cp_auto_notif.overdue FROM setting as s LEFT JOIN company_auto_notification as
         cp_auto_notif ON s.company_id=cp_auto_notif.company_id WHERE s.company_id=?`,[compId])

         if(result.length!==0){
            return res.status(200).json(result);
         }
         else{
            return res.status(404).json({success:false, title:'Please configure your company settings',message:'Settings are not configured yet , configure required settings'})
         }

      }

      catch(err){
      return res.status(500).json({title:'Server Error',message:'Failed return settings'});
      }

}


const HandleSaveCompanySettings= async(req,res)=>{
    const {compId}=req.user;
    if(!compId||!req.user){
        return res.status(400).json({ success:false,title:"Invalid company",message:"Unkown company"})
    }
    let conn;
     try{ 
      
       conn = await con.getConnection();
       await conn.beginTransaction();
      
       const [verifyissettingexist]= await conn.execute(`SELECT
       EXISTS(SELECT 1 FROM setting WHERE company_id = ?) AS setting_exists,
       EXISTS( SELECT 1 FROM company_auto_notification WHERE company_id = ?) AS notification_exists,
       EXISTS(SELECT 1 FROM office_charge WHERE company_id = ?) AS office_charge_exists`,[compId,compId,compId])
      const result=verifyissettingexist[0]
    //    if(result.setting_exists==0&& result.notification_exists==0&&result.office_charge_exists){
    //     console.log(result.setting_exists)
    //    };

      
   await conn.commit();


     }
     catch(err){
      if(conn) {await conn.rollback();}
       return res.status(500).json({success:false, title:'Server Error',message:"Failed to save settings"})
     }finally{
        if(conn) await conn.release();
     }
}



module.exports = {
    OverviewDash,
    getonlineuser,
    Transaction,
    cashier,
   CompanyAdmin_info,
   saveSpadminsetting,
   sendManualyNotification,
   ReturnCurrentSetting,
   GetCompanyAdmin,
   HandlesendTo,
   HandleReturnAdminList,
   HandlesaveAgent,
   LogAgent,
   CompanyCurrentSetting,
   HandleSaveCompanySettings
};