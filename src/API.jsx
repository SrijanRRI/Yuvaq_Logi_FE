let serverUrl = "http://localhost:5000"

const API = {

    // for authentication :
    SIGNUP : `${serverUrl}/api/auth/signup`,
    SIGNIN : `${serverUrl}/api/auth/signin`,
    FORGOTPASSWORD : `${serverUrl}/api/auth/forgotpassword`,
    RESETPASSWORD : `${serverUrl}/api/auth/resetpassword/`,
}
  
  export default API;
  