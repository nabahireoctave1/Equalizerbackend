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

  const GeneratePaymentSchedule=( loanId,installmentAmount,pay_frequency,totalPay, )=>{
       
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
                cs.interest_percentage,cs.payment_frequency  FROM client AS cl
               LEFT JOIN setting AS cs  ON cl.company_id = cs.company_id
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


const HandleSaveClientnfo= async(req,res)=>{
   if(!req.user) return null;
    const file= req.fiel? req.file.originalname:null


    let conn;

       const { clientId,client_name,client_address,client_contact,IdNumber,client_B_type, 
         client_B_location, amount, payment_frequency,intrest,security_name,secNumber,
         guarantor_name,guarantor_contact,cashier_name,installment,guarantor_address }=req.body;
         
       
           let {branchId,compId}=req.user;
           let totalPay= Number(amount)+amount*(intrest>0 ? intrest/100:0);
           const amountNumber=Number(amount);
           let amountAfterOfficeCharge=amountNumber;


         
   try{

   
    conn=await con.getConnection();
    await conn.beginTransaction();
     const loanid=await GenerateLoanID(conn);
      const schedules=
       GeneratePaymentSchedule(loanid,installment,payment_frequency,totalPay)

       const [officecharge]=await conn.execute(`SELECT company_id,branch_id, interest_percentage,
        startup_amount, end_amount FROM office_charge WHERE company_id=? AND branch_id=?`,[compId,branchId])
        
        const office=officecharge.find(
            (item)=>
            amountNumber>=Number(item.startup_amount)&&amountNumber<=Number(item.end_amount)
            
        );

        if(office){
            const officeinterest=office.interest_percentage;
            const office_charge=amountNumber*(officeinterest/100)

            amountAfterOfficeCharge= amountNumber-office_charge;
        }

        
    if(clientId){
     const [ExistingLoanData] = await conn.execute(`
    SELECT l.loan_id,l.client_id,l.client_name,l.totalpay,
    l.amount_given,b.branch_id,b.branch_name,ps.expected_amount,ps.paid_amount,
     ps.due_date, ps.status FROM loan l INNER JOIN branch b 
    ON l.branch_id = b.branch_id INNER JOIN payment_schedule ps 
    ON l.loan_id = ps.loan_id WHERE l.client_id = ?
`, [clientId]);

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
     const closingDate= schedules[schedules.length-1].dueDate;
await conn.execute(`
  INSERT INTO loan (
    loan_id,company_id,branch_id,client_id,client_name,national_id,totalpay,
    guarantor_name,guarantor_address,guarantor_contacts,amount_given,fees,pay_frequency,
    security_name,sec_number,sec_pic,approved
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`, [
  loanid,
  compId,
  branchId,clientId,client_name,IdNumber,
  totalPay,guarantor_name, guarantor_address,guarantor_contact,
  amount,intrest,payment_frequency,security_name,secNumber,
  file,cashier_name
]);

const values = schedules.map((schedule) => [
  schedule.loanId,
  schedule.dueDate,
  schedule.expectedamount,
  schedule.amountPaid,
  schedule.status,
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

   }


   catch(err){
    if(conn) {
        await conn.rollback();
    }
      console.log('Error in Handle saveclientinfo controller',err.message);
      return res.status(500).json({success:false,messagekey:'errors.server_error'})
   } finally{
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
    FindCurrentBranchBorrowers,HandleSaveClientnfo,HandlePay
}

