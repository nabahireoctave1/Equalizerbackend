const con=require('../mysql_connection/conn');
const crypto= require('crypto');
 require('dotenv').config();



 const GenerateLoanID= async(conn)=>{
  let LoanId=null;
  let exist=true;
  while(exist){
    const number= crypto.randomInt(1000,10000)
     LoanId=`LN${number}`
     const [row]= await conn.execute(`SELECT loan_id FROM loan WHERE loan_id=? LIMIT 1`,[LoanId])
        exist=row.length>0

  }
  
  if(exist===false) return LoanId

 }
 

 const GenerateClientId= async(conn)=>{
  let clientId=null;
  let exist=true;

  while(exist){
    const Id=crypto.randomInt(100000,1000000);
    clientId=Id;
       const [row]= await conn.execute(`SELECT client_id  FROM client WHERE client_id= ?`,[clientId]);
       exist=row.length>0;
  }

  if(exist===false) return clientId

 }


  const GeneratePaymentSchedule=( loanId,installmentAmount,pay_frequency,totalPay)=>{
       
    const totalAmount=Number(totalPay);
    const installment=Number(installmentAmount)

    const numberOfPayments=Math.ceil(totalAmount/installment)
    let dueDate=new Date();
      const schedules=[];  

    for(let i=0; i < numberOfPayments; i++){
        if(pay_frequency?.toLowerCase()==='daily'){
           dueDate.setDate(dueDate.getDate()+1);
        }

        if(pay_frequency?.toLowerCase()==='weekly'){
            dueDate.setDate(dueDate.getDate()+7);
        }


        if(pay_frequency?.toLowerCase()==='monthly'){
            dueDate.setMonth(dueDate.getMonth()+1);
        }

         const amountDue=
         i===numberOfPayments-1 ? totalAmount-installment*i:installment
        
         schedules.push({
            loanId:loanId,
            installmentNumer:i+1,
            dueDate:new Date(dueDate),
            expectedamount:amountDue,
            amountPaid:0,
            status:"pending"
         })

        
    }
         return schedules;


    

  }


const FindCurrentBranchBorrowers = async (req, res) => {
    if (!req.user) return;

    const { compId, branchId } = req.user;
 

    try {
        const [result] = await con.execute(`
            SELECT cl.company_id,cl.branch_id,cl.client_id, cl.national_id,cl.client_name,
                cl.phone,cl.client_address,cl.bussiness_type,cl.bussiness_location,
                cl.client_bussinessName,  cs.interest_percentage,cs.payment_frequency 
                 FROM client AS cl LEFT JOIN setting AS cs  ON cl.company_id = cs.company_id
                WHERE cl.company_id = ? AND cl.branch_id = ?
            `,
            [compId, branchId]
        );

        if (result.length > 0) {
            return res.status(200).json(result);
        }

        return res.status(404).json({isavailable: false});

    } catch (err) {
        console.log('Error in FindCurrentBranchBorrowers controller', err.message);
        return res.status(500).json({success: false,messagekey: 'errors.server_error'});
    }
};


const HandleSaveLoaninfo= async(req,res)=>{
   if(!req.user) return null;
    const file= req.fiel ? req.file.originalname:null
 
    let conn;

       const { clientId,client_name,client_address,client_contact,IdNumber,client_B_type, 
         client_B_location,client_B_Name, amount, payment_frequency,intrest,security_name,
         guarantor_name,guarantor_contact,cashier_name,installment,guarantor_address }=req.body;

       
           let {branchId,compId}=req.user;
           let totalPay= Number(amount)+amount*(intrest>0 ? intrest/100:0);
           const amountNumber=Number(amount);
           let amountAfterOfficeCharge=amountNumber;
           let chargeAmount=0;
                
   try{

   
    conn=await con.getConnection();
    await conn.beginTransaction();
     const loanid=await GenerateLoanID(conn);
      const schedules=
       GeneratePaymentSchedule(loanid,installment,payment_frequency,totalPay)
      const loan_closingDate= schedules[schedules.length-1].dueDate;
      
        const [officecharge]=await conn.execute(`SELECT interest_percentage,
        startup_amount, end_amount FROM office_charge WHERE company_id=? AND 
        branch_id=?`,[compId,branchId]);

        const office=officecharge.find(
            (item)=>
            amountNumber>=Number(item.startup_amount)&&amountNumber<=Number(item.end_amount)
            
        );

        if(office){
            const officeinterest=office.interest_percentage;
            const office_charge=amountNumber*(officeinterest/100)
            chargeAmount+=office_charge
            amountAfterOfficeCharge= amountNumber-office_charge;
        }

        console.log(chargeAmount)

     if(clientId){
     const [ExistingLoanData] = await conn.execute(`
    SELECT l.loan_id,l.client_id,l.client_name,l.totalpay,
    l.amount_given,b.branch_id,b.branch_name,ps.expected_amount,
    ps.paid_amount, ps.due_date, ps.status FROM loan l INNER JOIN
     branch b ON l.branch_id = b.branch_id INNER JOIN payment_schedule ps 
    ON l.loan_id = ps.loan_id WHERE l.client_id = ? AND l.company_id=?
`, [clientId,compId]);

   if(ExistingLoanData.length>0){
        const ClientLoanmapInfo={};
          ExistingLoanData.forEach((loan)=>{
            if(!ClientLoanmapInfo[loan.loan_id]){
                ClientLoanmapInfo[loan.loan_id]={
                    LoanId:loan.loan_id,
                    clientId:loan.client_id,
                    clientname:loan.client_name,
                    branch_name:loan.branch_name,
                    LoanAmount:loan.amount_given,
                    TotalExpected:0,
                    TotalPaid:0,
                    TotalUnpaid:0,
                    unpaidDays:0,
                    PartialPaymentCount:0,
                    
                }

            }

            const Loan=ClientLoanmapInfo[loan.loan_id];
            const expected=Number(loan.expected_amount);
            const paid=Number(loan.paid_amount);
            const  unPaid=Math.max(expected-paid,0);

            Loan.TotalExpected+=expected;
            Loan.TotalPaid+=paid;
            Loan.TotalUnpaid+=unPaid;

           if(loan.status?.toLowerCase()==='paid'){
             Loan.TotalPaidCount++;
           }
           if(loan.status?.toLowerCase()==='partial_paid'){
            Loan.PartialPaymentCount++;
           }
            if(loan.status==='overdue'){
               Loan.unpaidDays++;
            }
       
                

          })

          let TotalExpectedTopay=0;
          let TotalAmountPaid=0;
          let TotalUnpaidLoanAmount=0;
          let TotalLoan=0;
          let ClientName=null;
          const currentLoanInfo= Object.values(ClientLoanmapInfo);

         currentLoanInfo.forEach((loan)=>{
          TotalLoan+=currentLoanInfo.length;
          ClientName=loan.clientname;
          TotalExpectedTopay+=Number(loan.TotalExpected||0);
          TotalAmountPaid+=Number(loan.TotalPaid||0)
          TotalUnpaidLoanAmount+=Number(loan.TotalUnpaid||0);
         })
         
         const paymentRate=TotalExpectedTopay >0 ?
          Math.ceil((TotalAmountPaid/TotalExpectedTopay)*100):0;
            return res.status(200).json(
              {
                hasRecord:true,
                clientRecord:{
                  client_name:ClientName,
                   TotalAmountPaid:TotalAmountPaid,TotalLoan:TotalLoan,
                   TotalExpectedTopay:TotalExpectedTopay,
                TotalUnpaidLoanAmount:TotalUnpaidLoanAmount,paymentRate:paymentRate,
                loanInfo:currentLoanInfo

                }
              
              },
            );
        }
         else{
     const values = schedules.map((schedule) => [
    schedule.loanId,
     schedule.dueDate,
     schedule.expectedamount,
    schedule.amountPaid,
    schedule.status,
   ]);

   
await conn.execute(`
 INSERT INTO loan (loan_id, company_id, branch_id, client_id, client_name, national_id,
  client_address, client_contact, bussiness_location, bussiness_Type, client_bussinessName,
   guarantor_name, guarantor_address,guarantor_contacts, amount_given, Balance, 
   amountAfterOfficeCharge, chargeAmount, totalpay,fees,loan_closingDate,
    pay_frequency, security_name,sec_pic, approved) VALUES 
    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`,[loanid,compId,branchId,clientId,client_name,IdNumber,client_address,client_contact,client_B_location
  ,client_B_type,client_B_Name,guarantor_name,guarantor_address,guarantor_contact,amount,amount,
  amountAfterOfficeCharge,chargeAmount,totalPay,intrest,loan_closingDate,payment_frequency,security_name
  ,file,cashier_name
]);



 await conn.query(
  `INSERT INTO payment_schedule
   (loan_id, due_date, expected_amount, paid_amount, status)
   VALUES ?`,
  [values]
);


    
    await conn.commit();

    return res.status(200).json({success:true,
      hasRecord:false,
        TotalLoanPayment:totalPay,
        clientAllowedLoan:amountAfterOfficeCharge,
        messagekey:'success.loan_application_success'});

        }

        
    }   

    else{

      if(conn) await conn.rollback();
      return res.status(400).json({
        success:false,
        messagekey:'error.client_not_registered'
      })
    }
 
   


   }


   catch(err){
    if(conn) {
        await conn.rollback();
    }
      console.log(`Error in Handle saveclientinfo controller ${err.message}`,err);
      return res.status(500).json({success:false,messagekey:'errors.server_error'})
   } finally{
    if(conn) await conn.release();
   }
}


const FetchBorrowerInformation= async(req,res)=>{
  if(!req.user) return
  const {compId,branchId}=req.user;
     const {limit,page,search}=req.query;
     const Limitnum= Number(limit);
     const offset=(Number(page)-1)*Limitnum;
     let searchValue=`%${search}%`;

  try{

    const params=[compId,branchId];
  
    let query=` SELECT client_id, national_id, client_name, phone,
       client_address, bussiness_type, bussiness_location, 
      client_bussinessName FROM client WHERE company_id=? 
      AND branch_id=?`
      
     if(search){
       query += ` AND(client_name LIKE ? OR phone LIKE ? OR client_id LIKE ?) `
       params.push(searchValue,search,search)
     }

     query+=` ORDER BY id DESC LIMIT ? OFFSET ?`
      params.push(Limitnum,offset);

      const [result] =await con.execute(query,params);
   
      if(result.length>0){
        let countquery= `SELECT COUNT(*) AS totalBorrower FROM  client WHERE company_id=? AND branch_id=?`
        const countparams=[compId,branchId];
          if(search){
            countquery+=` AND(client_name LIKE ? OR phone LIKE ? OR client_id LIKE ?)`;
            countparams.push(searchValue,search,search);
          } 

          const [totalrecord]=await  con.execute(countquery,countparams);
          const TotalPage= Math.ceil(totalrecord[0].totalBorrower/Limitnum);
         

          return res.status(200).json({
            borrowersInfo:result,
            totalpage:TotalPage,
            totalRecord:totalrecord[0].totalBorrower

          })

        }
          
      return res.status(400).json({size:0,messagekey:"error.data_not_found"})
   

  }

  catch(err){
    console.log(`Error in FetchBorrowerInformation ${err.message}`)
    return res.status(500).json({size:1,messagekey:"error.servererror"})
  }
}





const HandleLoanConfirm= async(req,res)=>{
  if(!req.user) return
  const {compId,branchId}=req.user;
 
  const { clientId,client_name,client_B_Name,client_address,client_contact,IdNumber,client_B_type, 
         client_B_location, amount, payment_frequency,intrest,security_name,
         guarantor_name,guarantor_contact,cashier_name,installment,guarantor_address }=req.body;

         let conn;
         let totalPay=Number(amount)+Number(amount*intrest>0 ? amount*intrest/100:0)
           const amountNumber=Number(amount);
           let amountAfterOfficeCharge=amountNumber;
           let chargeAmount=0;
           let file= req.file ? req.file.originalname:null
           

    
  try{
 
    conn=await con.getConnection();
    await conn.beginTransaction();
  const loanId=await GenerateLoanID(conn)
  const schedules= GeneratePaymentSchedule(loanId,installment,payment_frequency,totalPay)
    const values = schedules.map((schedule) => [schedule.loanId,schedule.dueDate,
     schedule.expectedamount,schedule.amountPaid,schedule.status,]);
     let loan_closingDate=schedules[schedules.length-1].dueDate;
     const [office_charge]=await conn.execute(`SELECT interest_percentage,
        startup_amount, end_amount FROM office_charge WHERE company_id=? AND 
        branch_id=?`,[compId,branchId])
        console.log(office_charge);

      const office= office_charge.find((item)=>{
         amountNumber>=Number(item.startup_amount)&&amountNumber<=Number(item.end_amount)
         
      })
      console.log(office);

           if(office){
            const officeinterest=office.interest_percentage;
            const office_charge=amountNumber*(officeinterest/100)
            chargeAmount+=office_charge;
            amountAfterOfficeCharge= amountNumber-office_charge;
        }
      

        console.log((chargeAmount,amountAfterOfficeCharge))
    
await conn.execute(`
 INSERT INTO loan (loan_id, company_id, branch_id, client_id, client_name, national_id,
  client_address, client_contact, bussiness_location,bussiness_Type,client_bussinessName,
   guarantor_name, guarantor_address,guarantor_contacts,amount_given,Balance, 
   amountAfterOfficeCharge,chargeAmount,totalpay,fees,loan_closingDate,
    pay_frequency, security_name,sec_pic, approved) VALUES 
    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`,[loanId,compId,branchId,clientId,client_name,IdNumber,client_address,client_contact,client_B_location
  ,client_B_type,client_B_Name,guarantor_name,guarantor_address,guarantor_contact,amount,amount,
  amountAfterOfficeCharge,chargeAmount,totalPay,intrest,loan_closingDate,payment_frequency,security_name
  ,file,cashier_name
]);


 await conn.query(
  `INSERT INTO payment_schedule
   (loan_id, due_date, expected_amount, paid_amount, status)
   VALUES ?`,
  [values]
);


  

    await conn.commit();

    return res.status(200).json({success:true,messagekey:'success.loan_confirmation_success'})
 
  }

  catch(err){
    if(conn){ await conn.rollback(); }
    console.log(`Error in confirmLoan controller ${err.message}`)
     return res.status(500).json({success:false,messagekey:'error.servererror'})
  }finally{
   if(conn) await conn.release();
  }
}


const ReturnCurrentBranchLoans= async(req,res)=>{
  if(!req.user) return;

  const {compId,branchId}=req.user;
  const {Limit,page,search=""}=req.query;
  const Limitnum=Number(Limit);
  const offset= Number(page-1)*Limitnum;
  

  try{

    let query=` SELECT loan_id, company_id, branch_id, client_id, client_name,
       client_address, client_contact,guarantor_name, guarantor_address, guarantor_contacts, amount_given,
        Balance, DailyInstallment,amountAfterOfficeCharge, chargeAmount, totalpay, status,loan_closingDate,pay_frequency,
         security_name FROM loan WHERE company_id=? AND branch_id=?`
      
          const params=[compId,branchId];
            const searchValue=`%${search}%`
          
            if(search){
              query+=` AND (client_name LIKE ? OR loan_id= ?)`;
              params.push(searchValue,searchValue);

            }

      

          query +=` ORDER BY loan_id DESC LIMIT ? OFFSET ? `
          params.push(Limitnum,offset);

     const [result] =await con.execute(query,params);


         if(result.length>0){
          let countparams=[compId,branchId];

          let query= `SELECT COUNT(*) AS TotalLoan FROM loan WHERE company_id=? AND branch_id=?`
          
          if(search){
           query+= ` AND (client_name LIKE ? OR loan_id= ?)`
            countparams.push(searchValue,searchValue);
          }
         const [countLoan]=await con.execute(query,countparams);
           

         const totalPage= Math.ceil(countLoan[0].TotalLoan/Limit);

         
         return res.status(200).json({
          loan:result,
          totalpage:totalPage,
          page,
          totalLoan:countLoan[0].TotalLoan
         })
         
         

         } 

         return res.status(404).json({size:0,messagekey:`error.data_not_found`});

  }
  catch(err){
   console.log(`Error in returnCurrentBranchLoans controller ${err.message}`) 
   return res.status(500).json({size:1,messagekey:'error.server_error'})
  }


}




const HandleSaveBorrowerInfo= async(req,res)=>{
   if(!req.user) return
    const {name,ninid,phone,client_address,client_B_Name,client_B_location,client_B_type}=req.body;
    const {compId,branchId}=req.user;
     let conn;
     
     const error={};
       try{
        conn=await con.getConnection();
        await conn.beginTransaction();

      const [verify]= await conn.execute(`
        SELECT 
   EXISTS ( SELECT 1 FROM client WHERE phone=?) AS phoneexist,
   EXISTS(SELECT 1 FROM client WHERE national_id=?) AS ninidexist
        `,[phone,ninid]);


        if(verify[0].phoneexist){
          error.phone='client.phone_number_must_be_unique'
        }

        if(verify[0].ninidexist){
          error.ninid='client_ninid_must_be_unique'
        }
          

        if(Object.keys(error).length>0){

          return res.status(400).json({
            error
          })
        }

        const clientId=await GenerateClientId(conn);
      await conn.execute(`INSERT INTO client(client_id, national_id,
         company_id, branch_id, client_name,phone, client_address,
          bussiness_type, bussiness_location, client_bussinessName) 
         VALUES (?,?,?,?,?,?,?,?,?,?)`,[
         clientId,ninid,compId,branchId,name,phone,client_address,
         client_B_type,client_B_location,client_B_Name
         ])       

      await conn.commit();

        return res.status(200).json({success:true,messagekey:`success.client_registered`})

      
     
    }

    catch(err){
      if(conn) await conn.rollback();
      console.log(`Error in save Borrower information controller ${err.message}`)
      return res.status(500).json({success:false,messagekey:'error.servererror'})
    }finally{
      if(conn) await conn.release();
    }
} 



 const HandlePay= async(req,res)=>{
    if(!req.user) return
   
    const {compId,branchId,name}=req.user;
    const {paymentAmount,LoanId,client_name,clientId}=req.body;
    let conn;
    let  Message=null;
    try{
    
      conn=await con.getConnection();
      await conn.beginTransaction();
      
      const [row] =await conn.execute(`SELECT expected_amount,due_date,paid_amount,status
        FROM payment_schedule WHERE loan_id=? AND due_date<=CURRENT_DATE() AND
         status IN('partial_paid','overdue')`,[LoanId])
         if(row.length===0){
           const [paymetDueToday]=await conn.execute(`SELECT expected_amount FROM 
            payment_schedule WHERE loan_id=? AND due_date=CURRENT_DATE()+1`,[LoanId]);
            if(paymetDueToday.length===0){
              Message=`cashier ${name} no payment is on going to day please wait`
            }
            
            else{

                 const expected=parseFloat(paymetDueToday[0].expected_amount)||0
                const paymentAmoutNumber=parseFloat(paymentAmount);
                      if(paymentAmoutNumber<expected){
                            await conn.execute(`UPDATE payment_schedule SET paid_amount=?,status='partial_paid' 
                WHERE loan_id=? AND due_date=CURRENT_DATE()+1
                `,[paymentAmoutNumber,LoanId])

                await conn.execute(`UPDATE loan SET Balance = Balance -? WHERE loan_id=? AND client_id=?
                 AND branch_id=? `,[paymentAmoutNumber,LoanId,clientId,branchId]);

                 await conn.execute (`INSERT INTO repayment(loan_id, company_id, branch_id
                  , client_id, client_name, client_amount,signed_by) VALUES (?,?,?,?,?,?,?)`,[
                    LoanId,compId,branchId,clientId,client_name,paymentAmoutNumber,name
                  ])

                  Message= `cashier ${name} partail payment of ${paymentAmoutNumber} with borrower ${client_name} has been recoded `

            }
    
            if(paymentAmoutNumber>expected){
               const AdvAmount= paymentAmoutNumber-expected;

               await conn.execute(`UPDATE payment_schedule SET paid_amount=?,status='Advance' 
                WHERE loan_id=? AND due_date=CURRENT_DATE()+1`,[AdvAmount,LoanId])

                await conn.execute(`UPDATE loan SET Balance = Balance-? WHERE loan_id=?
                   AND client_id=? AND branch_id=?`,[paymentAmoutNumber,LoanId,clientId,branchId]);

                 await conn.execute (`INSERT INTO repayment(loan_id, company_id, branch_id
                  , client_id, client_name, client_amount,signed_by) VALUES (?,?,?,?,?,?,?)`,[
                    LoanId,compId,branchId,clientId,client_name,paymentAmoutNumber,name
                  ])

                  Message=`dear cashier  ${name} ${AdvAmount} of borrower ${client_name} 
                  has been recorded as advance`  

            }
            if(paymentAmoutNumber===expected){
              await conn.execute(`UPDATE payment_schedule SET paid_amount=?,status='paid'
                 WHERE loan_id AND due_date=CURRENT_DATE()+1`,[paymentAmoutNumber,LoanId]);

                await conn.execute(`UPDATE loan SET Balance = Balance-? WHERE loan_id=?
                   AND client_id=? AND branch_id=?`,[paymentAmoutNumber,LoanId,clientId,branchId]);

                 await conn.execute (`INSERT INTO repayment(loan_id, company_id, branch_id
                  , client_id, client_name, client_amount,signed_by) VALUES (?,?,?,?,?,?,?)`,[
                    LoanId,compId,branchId,clientId,client_name,paymentAmoutNumber,name
                  ])
             
                  Message=`dear cashier ${name} payment of ${paymentAmoutNumber} has been completed`
            }

            }
            
         }
         
         else{
          
          console.log('hari due zitishuwe ')
          // logic continue for pay unpaid installment


         }

         
        await conn.commit();
                
        console.log(Message);


    }

    catch(err){
    if(conn) await conn.rollback();
     console.log(`Error in HandlePaycontroller ${err.message}`)
    }finally{
      if(conn) await conn.release();
    }
 }


 const FetchRequestedPayments=async(req,res)=>{
  if(!req.user) return
   const {compId,branchId}=req.user;

   const {period}=req.query;
   let DateCondition=''

  try{

    switch(period){
    case 'today':DateCondition=`r.date >=CURRENT_DATE() AND r.date < CURRENT_DATE()+INTERVAL 1 DAY`
     break;
     case 'yesterday':DateCondition=`r.date >=CURRENT_DATE()- INTERVAL 1 DAY AND r.date < CURRENT_DATE()`
     break;
    case 'last7days':DateCondition=`r.date >=DATE_SUB(CURRENT_DATE(),INTERVAL 6 DAY) AND r.date<CURRENT_DATE()+INTERVAL 1 DAY`
    break;
   case'lastmonth':DateCondition=`r.date >= DATE_FORMAT(CURRENT_DATE() - INTERVAL 1 MONTH, '%Y-%m-01') AND r.date < DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')`
    break;   
   
   
  }
     
    
    const [result]=await con.execute(`
      SELECT r.client_id, r.client_name, r.client_amount, r.date,
       r.signed_by,r.status,r.payment_status,r.payment_field,
      l.DailyInstallment,l.Balance FROM repayment r INNER JOIN loan 
      l ON l.loan_id=r.loan_id WHERE r.company_id=? AND r.branch_id=? AND  
       ${DateCondition}`,[compId,branchId])

       if(result.length>0){
        return res.status(200).json(result);
       } else{
       return res.status(404).json({size:0,
        period:period, 
        messagekey:`error.payment_not_found`});
         
       }


  }
  catch(err){
    console.log(`Error in FetchTodaypayment controller ${err.message}`)
    return res.status(500).json({size:1,
      period:period,
      messagekey:'error.servererror'})
  }
 }



 const FetchFieldPayment= async(req,res)=>{
     const {compId,branchId}=req.user;
   
    let {search="",period,limit,page}=req.query;
    let params=[compId,branchId];
    let searchValue= `%${search}%`
    const Limitnum=Number(limit);
    const offset=Number(page-1)*Limitnum;


       
    try{
      let query= `SELECT r.loan_id, r.client_id,
       r.client_name, r.client_amount,r.date, r.status, r.payment_status,l.Balance
        FROM repayment r INNER JOIN loan l ON l.loan_id=r.loan_id WHERE r.company_id=? AND r.branch_id=? 
       AND r.payment_field='field'`

     let countquery=`SELECT COUNT(*) AS total_field_payment FROM repayment
     WHERE company_id=? AND branch_id=? AND payment_field='field'`;




     if(search){
       query+=` AND(r.client_name LIKE ? OR r.client_id LIKE ?)`
       countquery+=` AND(client_name LIKE ? OR client_id LIKE ?)`
       params.push(searchValue,search)
     }
     
     query+=' ORDER BY r.id DESC LIMIT ? OFFSET ?'
     params.push(Limitnum,offset);


      const [result]= await con.execute(query,params);
     if(result.length>0){
      const countparams=[compId,branchId]
      if(search ){
        countparams.push(searchValue,search);
      }

         let [totalPayment]= await con.execute(countquery,countparams)
           let [total_field_collected]=await con.execute(`
            SELECT COALESCE(SUM(client_amount),0) AS totalcollected
             FROM repayment WHERE payment_field='field'`);
         const totalPages=Math.ceil(totalPayment[0]?.total_field_payment/Limitnum);

          
         

        return res.status(200).json({
          field_payment:result,
          totalPage:totalPages,
          totalfieldpayment:totalPayment[0].total_field_payment,
          TotalCollected:total_field_collected[0].totalcollected
                    
        })
          
     }
     else{
 
     return res.status(404).json({size:0,messagekey:'error.field_payment_notfound'})

     }




    }
    catch(err){
      console.log(`Error in fetch field payment controller ${err.message}`);
      return res.status(500).json({size:1,messagekey:'server.servererror'});
    }
 }

  
 const FetchUnpaidHistory= async(req,res)=>{
  if(!req.user) return

  const {compId,branchId}=req.user;
  const {limit,page,search}=req.query;
  const Limitnum=Number(limit);
  const offset=Number(page-1)*Limitnum;

  let searchValue=`%${search}%`

  const params=[compId,branchId];
  
  const clientInfoMap={};

  try{
    let query= `SELECT ps.status,ln.loan_id,ln.Balance,cl.client_name,cl.client_id,
    cl.phone,cl.client_address,SUM(CASE WHEN ps.status='overdue' THEN 1 ELSE 0 END) AS unPaidwindowCount,
    SUM(CASE WHEN ps.status='partial_paid' THEN 1 ELSE 0 END) AS partialPaymentCount
    FROM payment_schedule ps INNER JOIN loan ln ON ln.loan_id=ps.loan_id INNER JOIN 
    client cl ON cl.client_id=ln.client_id WHERE ln.company_id= ? AND ln.branch_id=?
     AND ps.status IN('overdue','partial_paid') GROUP BY ln.loan_id`

     if(search){
      query+=` AND (LOWER(cl.client_name) LIKE LOWER(?) OR cl.client_id LIKE ? OR ln.loan_id LIKE ? )`
        params.push(searchValue,search,searchValue);
     }

     query+=` ORDER BY ln.id ASC LIMIT ? OFFSET ?`
     params.push(Limitnum,offset);
     
     const [result]= await con.execute(query,params);
      if(result.length>0){
      let countparams=[compId,branchId] 
      let  countquery= `SELECT COUNT(*) AS TotalRecord FROM (
      SELECT ln.loan_id FROM payment_schedule ps INNER JOIN loan ln
      ON ps.loan_id=ln.loan_id INNER JOIN client cl ON cl.client_id=ln.client_id
      WHERE ln.company_id=? AND ln.branch_id=? AND ps.status IN('partial_paid','overdue')
      `
     if(search){
      countquery+=` AND(LOWER(cl.client_name) LIKE LOWER(?) OR cl.client_id LIKE ? OR ln.loan_id LIKE ?)`;
      countparams.push(searchValue,search,searchValue);
     }

     countquery+=`GROUP BY ln.loan_id) AS groupedLoan`
   
     const [countResult]=await con.execute(countquery,countparams)
      
     const TotalRecord= Number(countResult[0].TotalRecord)
     const totalPages= Math.ceil(TotalRecord/Limitnum);

     return res.status(200).json({
      response:result,
      totalPages:totalPages,
      TotalRecord:TotalRecord

     })
     

      }
     


     return res.status(404).json({size:0,messagekey:`error.unpaid_data_notfound`})
    
 }

  catch(err){
    console.log(`Error in return unpaidHistorycontroller ${err.message}`)
    return res.status(500).json({size:1,messagekey:`error.servererror`})
  }
 }

 const HandleReturnCurrentCashierProfile= async(req,res)=>{
  if(!req.user) return
   const {compId,branchId,userId}=req.user;
  try{
      const [result]= await con.execute(`SELECT c.cashier_name, c.cashier_contact, 
      c.cashier_email, c.cashier_location, c.status,c.created_at,c.updated_at,
      b.location,cmp.company_name,u.names,u.profile_photo,u.role FROM cashier c INNER JOIN branch b ON b.branch_id=c.branch_id 
       INNER JOIN  company cmp ON c.company_id=c.company_id INNER JOIN users u ON u.user_id=c.cashier_id
        WHERE c.company_id=? AND  c.branch_id=? AND c.cashier_id=? GROUP BY c.company_id,c.branch_id`,[compId,branchId,userId]);
       
        if(result.length!==0){
        return res.status(200).json(result);
      }    
  }
  catch(err){
    console.log(`Error in HandleReturn current cashier information`,err.message);
    return res.status(500).json({size:1,messagekey:`error.servererror`})
  }
 }

 const CashierProfileUpdate= async(req,res)=>{
  if(!req.user) return
  const {compId,branchId,userId}=req.user;
  const {email,names,location,Contact}=req.body;
  const file= req.file ? req.file.filename:null;
  let conn;
  const error={};

  try{
    conn=await con.getConnection();

    await conn.beginTransaction();
   const now=new Date();

    const [exist]=await conn.execute(`SELECT 
   EXISTS(SELECT 1 FROM cashier WHERE cashier_contact=? AND cashier_id!= ?) AS inCashierexist, 
 EXISTS(SELECT 1 FROM users WHERE  phone=? AND user_id!= ?) AS inUserexist`,
 [Contact,userId,Contact,userId])

 if(exist[0].inCashierexist===1||exist[0].inUserexist===1){
  error.Contact='cashier.phone_number_must_be_unique';
 }


 if(Object.keys(error).length>0){
  return res.status(400).json({
    error
  })
 }

    await conn.execute(`UPDATE cashier SET cashier_name=?,cashier_contact=?,cashier_email=?,cashier_location=?,
       updated_at=? WHERE  company_id=? AND branch_id=? AND cashier_id=?`,
       [names,Contact,email,location,now,compId,branchId,userId]);

       await conn.execute(`UPDATE users SET names=?,email=?,phone=?,profile_photo=COALESCE(?,profile_photo),updated_at=?
         WHERE company_id=? AND branch_id=? AND user_id=?`,[names,email,Contact,file,now,compId,branchId,userId]);  


    await conn.commit();

   return res.status(200).json({sucess:true,messagekey:`success.cashier_profile_update_success`})    
       }
  catch(err){
   if(conn) await conn.rollback();  
   console.log(`Error in CashierUpdateProfilecontroller ${err.message}`)  
   return res.status(500).json({success:false,messagekey:`error.servererror`})

  } finally{
    if(conn) await conn.release();
  }
 }



 const HandleRequestNewLoan=async(req,res)=>{
  const {clientID,Loanamount,guarantor,guarantorContact,guarantorAddress}=req.body;
  let conn;
  const error= {};
  try{
    conn=await con.getConnection();
    await conn.beginTransaction();
   
    const [isIdexist]= await conn.execute(`SELECT client_id FROM client WHERE client_id=? LIMIT 1`,[clientID]);
    if(isIdexist.length===0){
      error.clientID=`client.Invalid_identity`;
    }
    if(Object.keys(error).length>0){
      return res.status(400).json({error});
    }
      
    const [currInfo]= await conn.execute(`
     SELECT c.client_id,c.company_id, c.branch_id, c.client_name,c.phone,c.client_address,
      c.bussiness_type,c.bussiness_location, c.client_bussinessName, 
      COALESCE(COUNT(l.loan_id),0) AS userActiveLoan,b.branch_name 
     FROM branch b INNER JOIN client c ON b.branch_id=c.branch_id  LEFT JOIN loan l ON c.client_id=l.client_id AND l.status='active'
     WHERE c.client_id=? GROUP BY c.client_id LIMIT 1
       `,[clientID]);

       const data=currInfo[0]
  
    
       await conn.execute(`INSERT INTO demand(company_id, branch_id, 
        client_id, client_name, contact, amount, businesstype, businessName,
         businesslocation, loan_taken, client_location,guarantor, guarantor_contact, guarantor_address)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            data.company_id,data.branch_id,data.client_id,data.client_name,data.phone,Loanamount,data.bussiness_type
            ,data.client_bussinessName,data.bussiness_location,data.userActiveLoan,data.client_address,guarantor,guarantorContact,
            guarantorAddress
          ])




    await conn.commit();

    return res.status(200).json({success:true,
      messagekey:`newLoan_request_submited`,
      clientName:data.client_name,
      branchName:data.branch_name

      
     })

  }

  catch(err){
    if(conn) await conn.rollback();
    console.log(`Error in Request new Loan controller${err.message}`)
    return res.status(500).json({success:false,messagekey:`error.servererror`});
   
  } finally{
    if(conn) await conn.release()
  }
 }


 const GetLoanHistory= async(req,res)=>{
   const {search}=req.query; 
   let searchValue=`%${search}%`
   const error={};
     try{     

        const [isExist]= await con.execute(`SELECT client_name,client_id FROM client WHERE client_name LIKE ? `,[search]);
        if(isExist.length===0){
        error.borrowername=`client.client_not_found`
        }        

       if(Object.keys(error).length>0){
        return res.status(400).json({error});
       }
       

      

    
  

   }


   catch(err){

   }


 }

 const MyRequest= async(req,res)=>{
  try{

  }


  catch(err){


  }
 }






 const FetchNotification= async(req,res)=>{
   try{


    
   }

   catch(err){

   }


 }



 const FetchCurrentDemand= async(req,res)=>{
  if(!req.user) return
  const {compId,branchId}=req.user;
  const {page,limit}=req.query;

  const offset= Number(page-1)*Number(limit);
  try{
    
    const [result]=await con.execute(`SELECT client_name, contact,businesstype, businessName,amount, 
      businesslocation, loan_taken, client_location,status, guarantor, guarantor_contact,
       guarantor_address,created_at FROM demand WHERE company_id=? AND branch_id=? LIMIT ? OFFSET ?`,
       [compId,branchId,Number(limit),offset]);
       
       if(result.length>0){
        const [countTotaldemand]=await con.execute(`SELECT COUNT(*) AS totalDemand FROM 
          demand WHERE company_id=? AND branch_id=?`,[compId,branchId]);

          const totalpage= Math.ceil(countTotaldemand[0].totalDemand/limit);
        return res.status(200).json({
          totalPage:totalpage,
          Totaldemand:countTotaldemand[0].totalDemand,
          demand:result
        });
       }

       return res.status(404).json({size:0,messagekey:`error.demand_not_found`})

  }

  catch(err){
    console.log(`Error in FetchCurrentDemand ${err.message}`);
    return res.status(500).json({size:1,messagekey:`error.servererror`})
}
 }

 const FetChOverLoanedHistory= async(req,res)=>{
  try{


  }

  catch(err){
    console.log(`Error FetchOverLoanedController ${err.message}`);
    return res.status(500).json({size:0,messagekey:`server.servererror`});
  }
 }

module.exports= {
    FindCurrentBranchBorrowers,HandleSaveLoaninfo,HandlePay,HandleLoanConfirm,
    ReturnCurrentBranchLoans,FetchBorrowerInformation,HandleSaveBorrowerInfo,
    FetchRequestedPayments,FetchFieldPayment,FetchUnpaidHistory,
    HandleReturnCurrentCashierProfile,CashierProfileUpdate,HandleRequestNewLoan,GetLoanHistory,
    MyRequest,FetchCurrentDemand,FetchNotification,FetChOverLoanedHistory
}

