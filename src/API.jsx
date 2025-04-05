let serverUrl = "http://localhost:5000"
// let serverUrl = "http://192.168.13.78:5000"

const API = {

    // for authentication :
    SIGNUP : `${serverUrl}/api/auth/signup`,
    SIGNIN : `${serverUrl}/api/auth/signin`,
    FORGOTPASSWORD : `${serverUrl}/api/auth/forgotpassword`,
    RESETPASSWORD : `${serverUrl}/api/auth/resetpassword/`,

    //Admin API :
    ALLAPPROVALREQUEST : `${serverUrl}/admin/pending-approvals`,
    APPROVEREQUEST : `${serverUrl}/admin/approve-user/`,
    REJECTREQUEST : `${serverUrl}/admin/reject-user/`,

    //Transport User
    FETCH_ALL_TRANSPORTER : `${serverUrl}/admin/transport-users`,
    FETCH_ALL_TENDERS : `${serverUrl}/tenders/assigned`,
    SUBMIT_QUOTATION : `${serverUrl}/quotation/submit`,
    SEE_QUOTATIONS : `${serverUrl}/tender/quotations`,

    //Tenders
    CREATE_TENDER : `${serverUrl}/tenders/create-tender`
}
  
  export default API;
  