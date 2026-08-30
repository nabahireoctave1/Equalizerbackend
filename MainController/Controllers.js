require('dotenv').config();
const con = require('../mysql_connection/conn');
 let {emitMessageTouserinGroup}=require('../otherController/controller')
 const crypto= require('crypto')
const {decodeResponse}=require('../HtmlCHars');
const {SendWhattappmessage}=require('../otherController/WhattappController')


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
            ) AS monthlyPayment`);


        if (result.length === 1) {
            let data = result[0]; 
            
            data.activeUsers = counter; 

            return res.status(200).json(data);
        }

    } catch (err) {
               console.log('err in overview dash controller', err.message);
        return res.status(500).json({
            size:1,
           message: "Due to server error occurred system can`t find real dashboard information " });
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


        return res.status(404).json({size:0, message:`No curretly transaction found,
             transaction will appeare here once created`})
    

    }
    catch(err){
      console.log('error in transaction controller',err.message)
      return res.status(500).json({size:1,message:`Due to server error system cant return any transaction logs`})
  
} 
    
}



const cashier= async (req,res)=>{
    try{
        const [result]=await con.execute('SELECT*FROM cashier')
        if(result.length!==0){
            return res.status(200).json(result)
        }
        return res.status(404).json({
            size:0,
            message:`no cashier is currently available, 
            cashier information will appeare here once registered`})
    }
    catch(err){
        console.log('error in cashier controller',err.message)
        return res.status(500).json({size:1, 
            message:`Due to server error system cant find cahier information 
            cashier information will appeare here once problem resolved`})
    }

} 


const CompanyAdmin_info= async(req,res)=>{
    try{
            const [result]= await con.execute(`SELECT company_name ,admin_name, admin_id,phone,
                status, created_at  FROM company`)
        if(result.length!==0){
            return res.status(200).json(result)
        }
        return res.status(404).json({size:0,message:'company admin information not found'});
    }
    catch(err){
        console.log('error in company admin controller',err.message)
        return res.status(500).json({size:1,message: ` Due to server error system cant find company admin informaton`})
    }

}


const ReturnCompanyLoans=async (req,res)=>{
    if(!req.user) return null;
  try{

const query= `SELECT l.company_id,.l.loan_id,l.client_id,
l.client_name,l.national_id,l.recieved_amount,l.totalpay,
l.unpaid_days,l.status as loan_status,l.guarantor_name,
l.guarantor_address,l.guarantor_contacts,l.closing_date,
l.fees,l.security,c.company_name FROM loan l
 INNER JOIN company c ON l.company_id=c.company_id`
const [result]=await con.execute(query);

let EachCmpLoansMap={};
if(result.length!==0){
result.forEach(cmp=>{
      if(!EachCmpLoansMap[cmp.company_id]){
        EachCmpLoansMap[cmp.company_id] ={
          companyId:cmp.company_id,
          company_name:cmp.company_name,
          totalLoaned:0,
          totalUnpaid:0,
          LoansCount:0,
          loans:[]

        }
    }

    if(cmp.loan_status.toLowerCase()==='unpaid'){
        EachCmpLoansMap[cmp.company_id].totalUnpaid+=Number(cmp.recieved_amount);
    }

    if(cmp.company_id){
     EachCmpLoansMap[cmp.company_id].loans.push({
      loanId:cmp.loan_id,
      clientId:cmp.client_id,
    client_name:cmp.client_name,
    client_nationalId:cmp.national_id,
    receive_amount:cmp.recieved_amount,
    totalpay:cmp.totalpay,
    unpaidDay:cmp.unpaid_days,
    status:cmp.loan_status,
    guarantor_name:cmp.guarantor_name,
    guarantor_address:cmp.guarantor_address,
    guarantor_contacts:cmp.guarantor_contacts,
    closing_date:cmp.closing_date,
    fees:cmp.fees,
    security:cmp.security

})

EachCmpLoansMap[cmp?.company_id].LoansCount+=1;
EachCmpLoansMap[cmp?.company_id].totalLoaned+=Number(cmp?.recieved_amount);
    }

// console.dir(EachCmpLoansMap,{depth:null});

})
return res.status(200).json(Object.values(EachCmpLoansMap))


}

return res.status(404).json({size:0,title:"Loans not found",
    message:"No loans have been recorded by any company yet, company loans will appear here once recorded"})


  }
  catch(err){
    console.log('Error in returncompanyLoans controller',err.message)
   return res.status(500).json({size:1,title:"Error occured",
    message:"Server error occured system can`t find current company loans"})
    
  }
}


const ReturnCurrentCompany= async(req,res)=>{
    if(!req.user) return null;
    try{
        const query=`
       SELECT c.company_name, c.company_id, c.admin_name, c.status,
        ( SELECT COALESCE(SUM(l.recieved_amount),0) FROM loan l
          WHERE l.company_id = c.company_id ) AS total_loans, 
          ( SELECT COALESCE(SUM(r.client_amount), 0) FROM repayment r 
           INNER JOIN loan l ON l.loan_id = r.loan_id WHERE l.company_id = c.company_id )
            AS total_repayments,   COALESCE(b.amount, 0) AS activation_payment, 
            COALESCE( DATE_FORMAT(b.started_date, '%d-%m-%Y'), 'Not activated' )
        AS activation_date FROM company c LEFT JOIN billing b ON b.company_id = c.company_id;
        ` 
             const [result]=await con.execute(query)

             if(result.length!==0){
                return res.status(200).json(result);
             }

              return res.status(404).json({size:0,title:'No company has recorded yet',
                message:`company information Not available , company 
                will appeare here once registered`})


    }

    catch(err){
      console.log('Error in return company controller',err.message)
       return res.status(500).json(
        {size:1,title:"Error occured",message:'Server Error occured can`t find company information'})
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
                return res.status(404).json({size:0,title:"No admin information found",
                    message:'No admin information found'});

             }

        return res.status(200).json(decodeResponse(result));  
}
    catch(err){
        console.log('Error in HandleReturnAdminList controller ',err.message);
        return res.status(500).json({size:1,title:"Error occured" ,
            message:"Server Error occured can`t find current admin information"});
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
    return res.status(404).json({size:0,title:"information not found", 
        message:"No agent had been recorded here agent will appeare here once registered"})
    
    }
    catch(err){
     return res.status(500).json({size:1,title:"Error occurred", message:"Server error occurred system can`t find agent information"})
    }
}



const CompanyCurrentSetting= async (req,res)=>{
    const {compId}=req.user;
    if(!compId){
        return null;
    }
      try{
      const [result] = await con.execute
      (`SELECT 
    s.*, n.reminder,n.overdue,o.branch_id,o.startup_amount, o.end_amount,o.interest_percentage AS office_interest,b.branch_name AS office_name,
    b.location AS office_location FROM setting s LEFT JOIN company_auto_notification n ON s.company_id = n.company_id
    LEFT JOIN office_charge o ON s.company_id = o.company_id LEFT JOIN branch b ON o.branch_id = b.branch_id WHERE s.company_id = ?
     ORDER BY o.branch_id ASC, o.startup_amount ASC`, [compId]);

         if(result.length!==0){
            return res.status(200).json(decodeResponse(result));
         }
         else{
            return res.status(404).json({success:false, size:0,message:'errors.setting_required_desc'})
         }

      }

      catch(err){
        console.log('Error in CompanyCurrentSetting controller',err.message)
      return res.status(500).json({size:1,message:'errors.server_error'});
      }

}


const HandleSaveCompanySettings= async(req,res)=>{
    if(!req.user) return null
    const {compId}=req.user;
    const payload= req.body;
    
  
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
       return res.status(200).json({success:true,message:'successfully setting saved'})

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
     }
     catch(err){
        if(conn) {await conn.rollback();}
        console.log('Error in update office charge controller',err.message);
     } finally{
        if(conn) await conn.release();
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
    let conn;

  try{
   
    conn=await con.getConnection();
    await conn.beginTransaction();
    const cashierId=await generateCashierUniqueId(conn);
    
   const [phone] = await conn.execute(
    `SELECT EXISTS ( SELECT 1 FROM cashier WHERE cashier_contact = ?) AS phone_exist`,
    [payload.phoneno]
);

if(phone[0].phone_exist===1){
    return res.status(400).json({success:false,messagekey:"errors.cashier_phone_exists"})
}

await conn.execute(`INSERT INTO cashier(cashier_id,branch_id,company_id,cashier_name, 
        cashier_contact,cashier_email,cashier_location) VALUES (?,?,?,?,?,?,?)`,[
         cashierId,payload.branch,compId,payload.names,payload.phoneno,payload.email,payload.location
        ])

    await conn.commit();

    let message=`hello cashier ${payload.names} Your security link is http://localhost/secure-password/?tkn=1q2q8w`
    
    SendWhattappmessage(payload.phone,message,payload.email    )
    return res.status(200).json({success:true,messagekey:"success.cashier_added"})


  }
  catch(err){
    if(conn){await conn.rollback()}
    console.log('Error in addcashier controller',err.message)
    return res.status(500).json({success:false,messagekey:"errors.server_error"})
  }finally{
    if(conn) await conn.release();
  }
}


const FetchCashier= async(req,res)=>{
    const {compId}=req.user;
     try{
       const [result]= await con.execute(`
   SELECT
   c.cashier_id,
    c.cashier_name,
    c.cashier_contact,
    c.cashier_email,
    c.cashier_location,
    c.status,
    b.branch_name
FROM cashier c
INNER JOIN branch b
    ON c.branch_id = b.branch_id
           WHERE c.company_id = ? ORDER BY c.id ASC`,[compId])
       if(result.length!==0){
        return res.status(200).json(decodeResponse(result));
       }
       return res.status(404).json({size:0,messagekey:"errors.cashiers_not_found"})
     }catch(err){
        console.log(err.message)
      return res.status(500).json({size:1,messagekey:`errors.server_error`})
     }
}

 const FetchRepaymentInfo= async(req,res)=>{
    if(!req.user||!req.user.compId) return;
    const {compId}=req.user;
    try{
      
        const [result]=await con.execute(`SELECT  
            l.loan_id , 
            r.client_name, 
            r.client_amount, r.date, r.status, 
            r.signed_by
             FROM repayment r 
             INNER JOIN loan l ON 
             r.loan_id=l.loan_id 
              WHERE r.company_id= ?`,[compId]);
              if(result.length!==0){
              return res.status(200).json(decodeResponse(result))

              }
              return res.status(404).json({size:0,messagekey:"errors.repayment_not_found"})
    }
    catch(err){
      console.log('Error in fetch repayment information controller',err.message)
      return res.status(500).json({size:1,messagekey:"errors.server_error"})
    }
 }


 const FetchCUrrentLoans= async (req,res)=>{
    if(!req.user||!req.user.compId){
        return 
    }
    const {compId}=req.user;
    try{  
       const branchsMap ={};
        const [result]=await con.execute(`
    SELECT b.branch_name,b.branch_id, l.client_id,l.recieved_amount,l.totalpay,l.fees,
     l.national_id,l.guarantor_name, l.guarantor_address,l.guarantor_contacts,l.approved,
      l.unpaid_days, l.closing_date,l.client_name,l.amount_given,l.status,l.pay_frequency,
      l.security FROM branch b LEFT JOIN loan l ON b.branch_id=l.branch_id
        WHERE l.company_id=?`,[compId])
         if(result.length!==0){
        result.forEach((row)=>{
            const amountGiven= Number(row?.amount_given||0)
            
            if(!branchsMap[row.branch_id]){
                branchsMap[row.branch_id]={
                    branchId:row.branch_id,
                    branchName:row.branch_name,
                    loanscount:0,
                    total_loaned:0,
                    totalunpaid:0,

                    loans:[]

                }

                if(row.status&&row.status.toLowerCase()==='unpaid'){
                branchsMap[row.branch_id].totalunpaid+=amountGiven;
                  }
                if(row.client_id){
                    branchsMap[row.branch_id].loans.push({
                        clientId:row.client_id,
                        client_names:row.client_name,
                        amount_given:amountGiven,
                        status:row.status,
                        guarantorname:row.guarantor_name,
                        guarantoraddress:row.guarantor_address,
                        guarantorcontacts:row.guarantor_contacts,
                        received_Amount:row.recieved_amount,
                        unpaidwindow:row.unpaid_days,
                        closingDate:row.closing_date,
                        clientnationalID:row.national_id,
                        totalpay:row.totalpay,
                        fees:row.fees,
                        payment_frequency:row.pay_frequency,
                        security:row.security,
                        approved_by:row.approved

                        
                    });

                    branchsMap[row.branch_id].loanscount +=1;
                    branchsMap[row.branch_id].total_loaned+=Number(row?.amount_given||0);
                }
            }

        })
         

        return res.status(200).json(decodeResponse(Object.values(branchsMap)));

        }

       return res.status(404).json({size:0,messagekey:"errors.loans_not_found"})
        


    }
    catch(err){
    console.log('Error in Fetch current Loans controllers',err.message);
    return res.status(500).json({size:1,messagekey:"errors.server_error"})
    }
 }


 const FetchAllCompanyClient= async(req,res)=>{
    if(!req.user) { return }
    const {compId}= req.user;
    try{
      
        const [response]=await con.execute(`
            SELECT c.national_id, c.company_id,c.branch_id,c.client_name,
             c.location, c.phone,c.client_address,b.branch_name FROM 
            client c INNER JOIN branch b ON c.branch_id=b.branch_id  
            WHERE c.company_id=? ORDER BY c.created_at ASC`,[compId])
            if(response.length!==0){
                return res.status(200).json(decodeResponse(response))
            }

            return res.status(404).json({size:0,messagekey:`errors.borrowers_not_found`})

    }
    catch(err){
        console.log('error in company client controller',err.message);
      return res.status(500).json({size:1,messagekey:'errors.server_error'})
    }
 }



 const SmsTransactionLog= async(req,res)=>{
     if(!req.user||!req.user.compId) return;
      const {compId}=req.user;  

   
    try{
     const [response]= await con.execute(`
        SELECT sms_id,amount, sms_purchase_total,
         date, status FROM sms_transaction_logs WHERE company_id=?`,[compId])

         if(response.length!==0){
            return res.status(200).json(response)
         }

         return res.status(404).json({size:0,messagekey:"errors.sms_not_found"})


    }
    catch(err){
       console.log('Error in sms transaction controller',err.message);
    }
 }


 const currentSMS= async(req,res)=>{
    if(!req.user||!req.user.compId) return
     
    const {compId}=req.user;
     try{
     
        const [response]= await con.execute(`SELECT
    c.company_id,
    c.messages AS remaining_sms,

    (
        SELECT 
            COALESCE(SUM(t.sms_purchase_total),0)
        FROM sms_transaction_logs t
        WHERE t.company_id=c.company_id
        AND t.package_status='active'
    ) AS total_purchase,

    (
        SELECT 
            COALESCE(SUM(sms_usg.sms_used),0)
        FROM company_sms_usage sms_usg
        WHERE sms_usg.company_id = c.company_id
    ) AS total_used

FROM company_sms_balance c
WHERE c.company_id =?`,[compId])

if(response.length!==0){
    return res.status(200).json({smsdata:response})

}

   let default_response=[{remaining_sms:0,total_purchase:0, total_used:0}];

  return res.status(200).json({smsdata:default_response});

     }
     catch(err){
        console.log('error in currentSMS controller',err.message)
     }


 } 





 const PurchaseSMS= async(req,res)=>{

console.log(req.body);

    try{

    }
    catch(err){

    }
 }




 const ChangeCompanyInfo= async(req,res)=>{
      if(!req.user) return null 
    const {compId}=req.user;
    
    let conn;

     try{
       conn=await con.getConnection();
        await conn.beginTransaction();
        const {companyName,companyAdmin,companyLocation}=req.body;
        const [result]=await conn.execute(`
            UPDATE company SET company_name=?,admin_name=?,location=? WHERE company_id=?
            `,[companyName,companyAdmin,companyLocation,compId])

     await conn.commit();

     if(result.affectedRows===1){
        return res.status(200).json({success:true,messagekey:'success.cpinfo_saved' })
     }


     }
    catch(err){
        if(conn){await conn.rollback();} 
        console.log('Error in Changecompany info controller',err.message);
        return res.status(500).json({messagekey:'errors.server_error'})
    } finally{
        await conn.release();
    }
 }


 const returncompanyCurrentInfo= async(req,res)=>{
    if(!req.user) return null;
    try{
        const {compId}=req.user;
        const Query= `SELECT company_id, company_name,location,admin_name,created_at,
        status FROM company WHERE company_id=?`
    const [result]=await con.execute(Query,[compId]);
    if(result.length!==0){
        return res.status(200).json(result);
    }

    return


    }
    catch(err){
    console.log('server Error in Return current companyInfo controller',err.message);
    }
 }


 const changeCashierInfo= async(req,res)=>{
   if(!req.user) return null;
     const {compId}=req.user;
     const {branch,names,email,phoneno,location,cashierId}=req.body
   
     let     conn;
    try{
        conn=await con.getConnection();
        await conn.beginTransaction();
        const Query=`
        UPDATE cashier SET branch_id=?,cashier_name=?
        ,cashier_contact=?,cashier_email=? ,cashier_location=?
         WHERE cashier_id=?`
      
       const [verifyPhone]= await conn.execute(`SELECT EXISTS (
            SELECT 1 FROM cashier WHERE cashier_contact=? AND cashier_id != ?
            ) as isexist`,[phoneno,cashierId])
        
            if(verifyPhone[0].isexist===1){
                return res.status(409).json({success:false,messagekey:'errors.cashier_phone_exists'})
            }
        
    const [result]= await conn.execute(Query,[branch,names,phoneno,email,location,cashierId]);
     await conn.commit();
     if(result.affectedRows===1){
        return res.status(200).json({success:true,messagekey:'success.save_cashier_changes'})
     }
    }
    catch(err){
     if(conn){ await conn.rollback()}
     console.log('Error in Change cashier information controller',err.message);
     return res.status(500).json({success:false,messagekey:'errors.server_error'})
    }finally{
        if(conn) await conn.release();
    }
 }


 const FetchCurrentcashierInformation= async (req,res)=>{
    const {cashierId}=req.params;
    try{
  
        const [result]=await con.execute(`SELECT cashier_name,cashier_contact,
                 cashier_email,cashier_location FROM cashier WHERE cashier_id=?`,[cashierId]);


                 if(result.length!==0){
                    return res.status(200).json(decodeResponse(result[0]));
                 }

            return;

    }
    catch(err){
        console.log('Error in fetchcurrentcashierinformation',err.message);
    }
 }



 const DeleteCashier= async(req,res)=>{
    if(!req.user) return null
    let {compId}=req.user;
    const {cashierId}=req.params;
    let conn;
    try{

        conn=await con.getConnection();
        await conn.beginTransaction();

        const [result]= await conn.execute('DELETE FROM cashier WHERE cashier_id=?',[cashierId])

        await conn.commit();

        if(result.affectedRows===1){
            return res.status(200).json({success:true,messagekey:"success.cashier_del_success"})
        }
             


    }
    catch(err){
        if(conn) await conn.rollback();
        console.log('Error in delete cashier controller',err.message);
        return res.status(500).json({success:false,messagekey:'errors.server_error'})

    }
    finally{
        if(conn) await conn.release();
    }
 }


 const SuspendCashier= async(req,res)=>{
   if(!req.user) return null;
   const {cashierId}=req.params;
   let conn;
    try{
        conn=await con.getConnection();
        await conn.beginTransaction();
        const [result]= await conn.execute(`UPDATE cashier SET status='suspended' WHERE cashier_id=?`,[cashierId]);
       await conn.commit();
       if(result.affectedRows===1){
        return res.status(200).json({success:true,messagekey:"success.suspend_cashier_complete"});
       }


    }

    catch(err){
     if(conn) await conn.rollback();
     console.log('Error in suspendcashierController',err.message);
     return res.status(500).json({success:false,messagekey:"errors.server_error"})
    } finally{
        if(conn) await conn.release();
    }
 }


 const ReactivateCashier= async (req,res)=>{
    if(!req.user) return null;
    const {cashierId}=req.params;
    let conn;
    try{
        conn=await con.getConnection();
        await conn.beginTransaction();
         
        const [result]=await conn.execute(`UPDATE cashier SET status='active' WHERE cashier_id=`,[cashierId])

        await conn.commit();

        if(result.affectedRows===1){
            return res.status(200).json({success:true,messagekey:'success.reactivate_cashier_complete'})
        }
      

    }
    catch(err){
      if(conn) await conn.rollback();
      console.log('Error in Reactivate cashier controller',err.message);
      return res.status(500).json({success:false,messagekey:"errors.server_error"});
    }finally{
        if(conn) await conn.release();
    }
 }



 const FetchFlagedBorrowers= async(req,res)=>{
    if(!req.user) return null;
    const {compId}=req.user;
     try{
     const [response]= await con.execute(`SELECT  cf.client_name, cf.reported_by, cf.reason, cf.date, cf.status
     FROM client_flag cf WHERE company_id=? ORDER BY cf.date DESC;`,[compId]);
    if(response.length!==0){
      return res.status(200).json(response);
    } 
     
    return res.status(404).json({size:0,messagekey:"errors.no_flagged_borrowers"})

    }
    catch(err){
    console.log('Error in fetchFlagedBorrower controller',err.message);
    return res.status(500).json({size:1,messagekey:"errors.server_error"});
    }
 }

 const RejectRequest =async(req,res)=>{
    if(!req.user) return null;
     let {client_name}=req.params;
     let conn;
    try{
        conn=await con.getConnection();
        conn.beginTransaction();
        const [response]=await conn.execute(`UPDATE client_flag SET status='rejected' WHERE client_name=?`,[client_name])
        await conn.commit();

        if(response.affectedRows===1){
            return res.status(200).json({success:true,size:0,messagekey:'success.reject_success'})
        }

    }
    catch(err){
        if(conn) {await conn.rollback()}
       return res.status(500).json({success:false,size:1,messagekey:"errors.server_error"})
    }finally{
    if(conn) await conn.release();
    }
 }


 const RequestApproval= async (req,res)=>{
     if(!req.user) return null;
     const {client_name}=req.params;
         let conn;
     try{
        conn=await con.getConnection();
        await conn.beginTransaction();

        const [response]=await conn.execute(`UPDATE client_flag SET status='approved' WHERE client_name=?`,[client_name])
        
        await conn.commit();
      
        if(response.affectedRows===1){
       return res.status(200).json({success:true,size:0,messagekey:"success.approval_success"})
        }
    


     }
     catch(err){
      if(conn) {await conn.rollback()}
        console.log('Error in RequestApproval request',err.message)
     return res.status(500).json({success:false,size:1,messagekey:"errors.server_error"})

     } finally{
        if(conn) await conn.release();
     }
 }

 const UpdateProfile= async(req,res)=>{
    if(!req.user) return null;
 const {names,phone,email,nid}=req.body;
 const {userId,compId}=req.user;



       let filename= req.file ? req.file.filename:null;
    
    let conn;
    try{
        conn=await con.getConnection();
        await conn.beginTransaction();

 const [exists] = await conn.execute(
    `SELECT EXISTS ( SELECT 1 FROM users  WHERE email = ? AND user_id != ? ) AS email_exist,
EXISTS( SELECT 1 FROM users WHERE phone = ? AND user_id != ? ) AS phone_exist,
 EXISTS( SELECT 1  FROM company WHERE admin_id = ? AND company_id != ?
        ) AS admin_id_exist`,
    [email, userId, phone, userId, nid, compId]
);

if(exists[0].email_exist){
      return res.status(400).json({success: false,messagekey: 'errors.email_exist' });
}

if(exists[0].phone_exist){
 return res.status(400).json({success: false,messagekey: 'errors.phone_exist'});
}
    
if(exists[0].admin_id_exist){
 return res.status(400).json({success: false,messagekey: 'errors.admin_id_exist'});

}

    await conn.execute(`UPDATE users SET names= ?
         , email=? , phone= ?, profile_photo=COALESCE(?,profile_photo) 
         WHERE user_id=?`,[names,email,phone,filename,userId])

    await conn.execute('UPDATE company SET admin_name=?, phone=?,admin_id=? WHERE company_id=?',[
         names,phone,nid,compId
        ])

        await conn.commit();

        return res.status(200).json({success:true,messagekey:'success.update_profile_done'})

    }
    catch(err){
     if(conn) await conn.rollback();
     console.log('Error in UpdateProfile',err.message)
     return res.status(500).json({success:false,messagekey:"errors.server_error"})
    }finally{
        if(conn) await conn.release();
    }
 }


 const FetchProfileInfomation=async (req,res)=>{
    if(!req.user) return null;
    const {userId}=req.user;
  try{
    const [response]= await con.execute(`
        SELECT u.names,u.email,u.phone,u.profile_photo
        ,u.status,u.created_at,u.updated_at, u.role,
        c.admin_id,c.company_name,c.location
        ,c.admin_id,c.status AS company_status FROM users u INNER JOIN
         company c ON u.company_id=c.company_id WHERE
          user_id=?`,[userId]);
       
          if(response.length!==0){
           return res.status(200).json(response);
          }
     
    }
    catch(err){
    console.log('Error in Fetchprofilecontroller',err.message)
    return res.status(500).json({messagekey:"errors.server_error"})
} 
}



module.exports = {
    OverviewDash,getonlineuser,Transaction,cashier,
   CompanyAdmin_info,saveSpadminsetting,sendManualyNotification,ReturnCurrentSetting,
   GetCompanyAdmin,HandlesendTo,HandleReturnAdminList,HandlesaveAgent,LogAgent,CompanyCurrentSetting,
    HandleSaveCompanySettings,updateofficecharge,ReturnCompanyBranch,AddCashier,FetchCashier,FetchRepaymentInfo,
   FetchCUrrentLoans,FetchAllCompanyClient,SmsTransactionLog,currentSMS,PurchaseSMS,ChangeCompanyInfo,returncompanyCurrentInfo,
   changeCashierInfo,DeleteCashier,FetchCurrentcashierInformation,SuspendCashier,ReactivateCashier,FetchFlagedBorrowers
   ,RejectRequest,RequestApproval,UpdateProfile,FetchProfileInfomation,ReturnCompanyLoans,ReturnCurrentCompany
};