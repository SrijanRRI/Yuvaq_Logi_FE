// Development : 
let serverUrl = "http://localhost:5000";

// Production : 
// let serverUrl = "https://logiyatrabe.rrispat.in" 



// (Deployed On Render)
// let serverUrl = "https://tenderappbe.onrender.com" 

// // // // Default API URLs --- while Deploying : 
// // const DOMAIN_URL = "https://logiyatrabe.rrispat.in";
// // const IP_URL = "http://192.168.13.60:8000";

// // Default API URLs --- for local use: 
// const DOMAIN_URL = "http://localhost:5000";
// const IP_URL = "http://192.168.13.78:5000";

// export let serverUrl = localStorage.getItem("serverUrl") === "IP" ? IP_URL : DOMAIN_URL;

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
 APPROVEREQUEST: `${serverUrl}/admin/users/`,
 REJECTREQUEST: `${serverUrl}/admin/reject-user/`,
 GETALLTENDER : `${serverUrl}/admin/all-tender`,
 GET_ALL_REPORTS : `${serverUrl}/admin/tenders/ranked-best-report`,

  //Transport User
  FETCH_ALL_TRANSPORTER: `${serverUrl}/admin/transport-users`,
  UPCOMING_TENDERS: `${serverUrl}/tenders/transporter/upcoming`,
  LIVE_BIDING_TENDERS: `${serverUrl}/tenders/assigned`,
  GET_QUOTATION_SLIDESHOW: `${serverUrl}/quotation/my-tender-quotes`,
  GET_MY_POSITION: `${serverUrl}/tenders/my-position`,
  
  SUBMIT_QUOTATION: `${serverUrl}/quotation/submit`,
  SEE_QUOTATIONS: `${serverUrl}/tender/quotations`,
  HISTORY_FOR_QUOTATION_QUOTE: `${serverUrl}/tenders/quotation/history`,
  
  //RR USer Tenders
  CREATE_TENDER: `${serverUrl}/tenders/create-tender`,
  FETCH_ALL_TENDER_CREATED_BY_RRUSER: `${serverUrl}/tenders/my-tenders`,
  FETCH_ALL_QUOTATION_FOR_PARTICULAR_TENDER: `${serverUrl}/tenders/quotations`,
  FINALIZE_TENDER: `${serverUrl}/tenders/finalize`,
  REOPEN_QUOTATION: `${serverUrl}/tenders/reopen`,

  //Shipment Details and Shipment Planned and shipment post api : 
  SHIPMENT_DETAILS : `${serverUrl}/shipment-planning`,

  //Whatsapp notification api : 
  WHATSAPP_NOTIFICATION : `${serverUrl}/tenders`,

  //API for session checking 

  CHECK_ME : `${serverUrl}/api/auth/me`,

FINALIZE_TENDER_CREATE_ORDER: `${serverUrl}/tenders`, // use with /:id/finalize/payment/order

FINALIZE_TENDER_VERIFY_PAYMENT: `${serverUrl}/tenders`, // use with /:id/finalize/payment/verify

}; 

// export const switchServerUrl = (mode) => {
//   localStorage.setItem("serverUrl", mode);

//   const path = window.location.pathname + window.location.search;

//   //  // Define your frontend URLs explicitly --- Deployment:
//   //  const frontendDomain = "https://logiyatra.rrispat.in";
//   //  const frontendIP = "http://192.168.13.60";

//  // Frontend URLs
//   const frontendDomain = "http://localhost:5173";
//   const frontendIP = "http://192.168.13.77:5173";

//   // Select frontend URL based on mode
//   const frontendUrl = mode === "DOMAIN" ? frontendDomain : frontendIP;

//   // Add slight delay to ensure localStorage is set
//   setTimeout(() => {
//     console.log("Redirecting to:", `${frontendUrl}${path}`);
//     window.location.href = `${frontendUrl}${path}`;
//   }, 100);
// };

export default API;
