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
  try{
  
    const [result] =await con.execute(`
      SELECT client_id, national_id, client_name, phone,
       client_address, bussiness_type, bussiness_location, 
      client_bussinessName FROM client WHERE company_id=? 
      AND branch_id=?`,[compId,branchId]);
   
      if(result.length>0){return res.status(200).json(result)}
          
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
  try{
     const [result] =await con.execute(`
      SELECT loan_id, company_id, branch_id, client_id, client_name,
       client_address, client_contact,guarantor_name, guarantor_address, guarantor_contacts, amount_given,
        Balance, DailyInstallment,amountAfterOfficeCharge, chargeAmount, totalpay, status,loan_closingDate,pay_frequency,
         security_name FROM loan WHERE company_id=? AND branch_id=?`,[compId,branchId]);

         if(result.length>0){
          return res.status(200).json(result);

         } 

         return res.status(400).json({size:0,messagekey:`error.data_not_found`});

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
    console.log(req.body);
    try{
        
     

    }

    catch(err){


    }
 }



module.exports= {
    FindCurrentBranchBorrowers,HandleSaveLoaninfo,HandlePay,HandleLoanConfirm,
    ReturnCurrentBranchLoans,FetchBorrowerInformation,HandleSaveBorrowerInfo
}

