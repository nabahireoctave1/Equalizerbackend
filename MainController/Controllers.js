require('dotenv').config();
const con = require('../mysql_connection/conn');
 let {emitMessageTouserinGroup}=require('../otherController/controller')
 const crypto= require('crypto')
const {decodeResponse}=require('../HtmlCHars');
const { off } = require('cluster');



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

const generateCashierUniqueId=async(conn)=>{
 while(true){
    const randomId=crypto.randomInt(1000000,9999999);
    const [rows]= await conn.execute('SELECT cashier_id FROM cashier WHERE cashier_id=?',[randomId])
    if(rows.length===0){
    return randomId;
  }
 }
}

const generateBranchId= async(conn)=>{
    while(true){
        const branchId=crypto.randomInt(1000000,9999999);
        const [rows]=await conn.execute('SELECT branch_id FROM cashier WHERE branch_id=?',[branchId])
        if(rows.length===0){
            return branchId
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
      const [result]=await con.execute(`SELECT s.*,n.reminder,n.overdue,o.startup_amount,
      o.end_amount, o.interest_percentage as office_interest FROM setting
       s LEFT JOIN company_auto_notification n ON
       s.company_id = n.company_id LEFT JOIN office_charge o ON 
       s.company_id = o.company_id WHERE s.company_id = ?`,[compId])

         if(result.length!==0){
            return res.status(200).json(result);
         }
         else{
            return res.status(404).json({success:false, title:'Please configure your company settings',message:'Settings are not configured yet , configure required settings'})
         }

      }

      catch(err){
        console.log(err)
      return res.status(500).json({title:'Server Error',message:'Failed return settings'});
      }

}


const HandleSaveCompanySettings= async(req,res)=>{
    const {compId}=req.user;
    const payload= req.body;
    
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
       EXISTS(SELECT 1 FROM office_charge WHERE branch_id = ?) AS office_charge_exists`,[compId,compId,payload.setting.officeId])
      const result=verifyissettingexist[0]
       if(result.setting_exists===0){
         await conn.execute(`INSERT INTO setting(company_id,report_generetion_time,
            interest_percentage, payment_frequency,grace_period) VALUES (?,?,?,?,?)`,[
              compId,  
             payload.setting.report_generetion_time,
             payload.setting.interest_percentage,
             payload.setting.payment_frequency,
             payload.setting.grace_period,
            ])
         
       }
       else{
        await conn.execute(`UPDATE setting SET report_generetion_time=?,interest_percentage=?,
            payment_frequency=?,grace_period=? WHERE company_id=?`,[payload.setting.report_generetion_time,
            payload.setting.interest_percentage,payload.setting.payment_frequency,payload.setting.grace_period,
            compId
            ])

       }

       if(result.notification_exists===0){
         await conn.execute(`INSERT INTO company_auto_notification
            (company_id, Reminder, overdue) VALUES (?,?,?)`,[
               compId,
               payload.setting.reminder,
               payload.setting.overdue
             ])
       }
       else{
        await conn.execute(`UPDATE company_auto_notification SET 
            Reminder=?,overdue=?,updated_at=NOW() WHERE company_id=?`,[
               payload.setting.reminder,
               payload.setting.overdue,
                compId
                
            ])
       }

       if(result.office_charge_exists===0){
        if (payload.officecharge.length !== 0) {
            payload.officecharge.map( async(data)=>{
             
           await conn.execute(`INSERT INTO office_charge(company_id,branch_id,interest_percentage,
            startup_amount,end_amount) VALUES (?,?,?,?,?)`,[
              compId,
             payload.setting.officeId,
             data.office_interest,
             data.start_up,
             data.ending,
             ])
            
            })
    }
       }

       else{
        if(payload.officecharge.length!==0){
         const [del]=await conn.execute('DELETE FROM office_charge WHERE branch_id=?',[payload.setting.officeId]);
         if(del.affectedRows>0){
          payload.officecharge.map(async(data)=>{
              await conn.execute(`INSERT INTO office_charge(company_id,branch_id,interest_percentage,
            startup_amount,end_amount) VALUES (?,?,?,?,?)`,[
              compId,
             payload.setting.officeId,
             data.office_interest,
             data.start_up,
             data.ending,
             ])
          })
         }
        }

       }
       await conn.commit();
       return res.status(200).json({success:true,message:'successfully  saved'})

     }
     catch(err){
      if(conn) {await conn.rollback();}
      console.log('error in Handlesave setting controller',err.message)
       return res.status(500).json({success:false,message:"Failed to save settings"})
     }finally{
        if(conn) await conn.release();
     }
}


const updateofficecharge=async(req,res)=>{
    const  isenabled=req.body.isofficechargeopen;
    const {compId}=req.user;
    let conn;
     try{
      conn= await con.getConnection()
     await conn.beginTransaction();

       await conn.execute('UPDATE setting SET isofficechargeenabled=? WHERE company_id=?',[isenabled,compId]);

       await conn.commit();
        return res.status(200).json({
    success: true,
    message: isenabled
        ? 'Office charge is enabled'
        : 'Office charge is disabled '
});
     }
     catch(err){
        if(conn) {await conn.rollback();}
        return res.status(500).json({message:'Server Error'})
     }
}


const ReturnCompanyBranch=async(req,res)=>{
    const {compId}=req.user;
    if(!compId||!req.user){
        return res.status(200).json({success:false,message:"unnkown company"});
    }

    try{  
     const [result]=await con.execute('SELECT branch_id, branch_name FROM branch WHERE company_id=?',[compId]);

     if(result.length!==0){
        return res.status(200).json(result);
     }
     return res.status(404).json({message:"No office found please  make sure you have office"});


    }catch(err){
    console.log('Error in Return Branch controller',err.message);
    }
}


const AddCashier= async(req,res)=>{
    const {compId}=req.user;
    const payload=req.body;
    console.log(payload)
    let conn;

  try{
   
    conn=await con.getConnection();
    await conn.beginTransaction();
    const cashierId=await generateCashierUniqueId(conn);
    await conn.execute(`INSERT INTO cashier(cashier_id,branch_id,company_id,cashier_name, 
        cashier_contact,cashier_email,cashier_location) VALUES (?,?,?,?,?,?,?)`,[
         cashierId,payload.branch,compId,payload.names,payload.phoneno,payload.email,payload.location
        ])

    await conn.commit();
    return res.status(200).json({success:true,message:"Cashier have been added"})


  }
  catch(err){
    if(conn){await conn.rollback()}
    console.log(err.message)
    return res.status(500).json({success:false,message:"Failed to save cashiers"})
  }finally{
    if(conn) await conn.release();
  }
}


const FetchCashier= async(req,res)=>{
    const {compId}=req.user;
     try{
       const [result]= await con.execute(`
   SELECT
    c.cashier_name,
    c.cashier_contact,
    c.cashier_email,
    c.cashier_location,
    c.status,
    b.branch_name
FROM cashier c
INNER JOIN branch b
    ON c.branch_id = b.branch_id
           WHERE c.company_id = ?`,[compId])
       if(result.length!==0){
        return res.status(200).json(result);
       }
       return res.status(404).json({size:0,message:"Cashier not found"})
     }catch(err){
        console.log(err.message)
      return res.status(500).json({size:1,message:`Unexpected server error occured while loading cashiers. Plaese try again!`})
     }
}

 const FetchRepaymentInfo= async(req,res)=>{
    try{
      
        const [result]=await con.execute('')

    }
    catch(err){

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
   HandleSaveCompanySettings,
   updateofficecharge,
   ReturnCompanyBranch,
   AddCashier,
   FetchCashier
};