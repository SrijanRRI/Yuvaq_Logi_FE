let serverUrl = "http://localhost:5000";
// let serverUrl = "http://192.168.13.78:5000"
// let serverUrl = "https://tenderappbe.onrender.com"
// let serverUrl = "https://logiyatrabe.rrispat.in"

const API = {
  // for authentication :
  SIGNUP: `${serverUrl}/api/auth/signup`,
  SIGNIN: `${serverUrl}/api/auth/signin`,
  FORGOTPASSWORD: `${serverUrl}/api/auth/forgotpassword`,
  RESETPASSWORD: `${serverUrl}/api/auth/resetpassword/`,
  LOGOUT_USER : `${serverUrl}/api/auth/logout`,
  GETALLUSER : `${serverUrl}/api/auth/user/all`,

 //Admin API :
 ALLAPPROVALREQUEST: `${serverUrl}/admin/pending-approvals`,
 APPROVEREQUEST: `${serverUrl}/admin/approve-user/`,
 REJECTREQUEST: `${serverUrl}/admin/reject-user/`,
 GETALLTENDER : `${serverUrl}/admin/all-tender`,

  //Transport User
  FETCH_ALL_TRANSPORTER: `${serverUrl}/admin/transport-users`,
  FETCH_ALL_TENDERS: `${serverUrl}/tenders/assigned`,
  SUBMIT_QUOTATION: `${serverUrl}/quotation/submit`,
  SEE_QUOTATIONS: `${serverUrl}/tender/quotations`,
  HISTORY_FOR_QUOTATION_QUOTE: `${serverUrl}/tenders/quotation/history`,

  //RR USer Tenders
  CREATE_TENDER: `${serverUrl}/tenders/create-tender`,
  FETCH_ALL_TENDER_CREATED_BY_RRUSER: `${serverUrl}/tenders/my-tenders`,
  FETCH_ALL_QUOTATION_FOR_PARTICULAR_TENDER: `${serverUrl}/tenders/quotations`,
  FINALIZE_TENDER: `${serverUrl}/tenders/finalize`,

  //API for session checking 

  CHECK_ME : `${serverUrl}/api/auth/me`,
};

export default API;
