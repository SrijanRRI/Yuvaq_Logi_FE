// let serverUrl = "http://localhost:5000"
let serverUrl = "http://192.168.13.78:5000"

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

    //Tenders
    CREATE_TENDER : `${serverUrl}/tenders/create-tender`
}
  
  export default API;
  