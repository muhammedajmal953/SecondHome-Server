export const Admin_Routes = {
  Login: "/login",
  Get_All_Users: "/getAllUsers/:page/:limit",
  BLOCK_USER: "/blockUser",
  UNBLOCK_USER: "/unBlockUser",
  GET_ALL_VENDORS: "/getAllVendors/:page/:limit",
  VERIFY_VENDOR: "/verifyVendor",
  GET_ALL_HOSTELS: "/getAllHostel/:page",
  REFRESH_TOKEN: "/token",
  BLOCK_HOSTEL: "/blockHostel",
  UNBLOCK_HOSTEL: "/unBlockHostel",
};



export const USER_ROUTES = {
    SIGN_UP: '/sign-up',
    VERIFY_OTP: '/verify-otp',
    LOGIN: '/login',
    GOOGLE_LOGIN: '/google-login',
    FORGOT_PASSWORD: '/forgot-password',
    CHANGE_PASSWORD: '/change-password',
    GET_USER: '/getUser',
    EDIT_PROFILE: '/edit-profile',
    GET_ALL_HOSTEL: '/getAllHostel/:page',
    CHANGE_PASSWORD_NEW: '/changePassword',
    TOKEN: '/token',
    RESEND_OTP: '/resend-otp',
    GET_HOSTEL: '/getHostel/:id'
  };
  
  export const VENDER_ROUTES = {
    SIGN_UP: '/sign-up',
    VERIFY_OTP: '/verify-otp',
    LOGIN: '/login',
    GOOGLE_LOGIN: '/google-login',
    FORGOT_PASSWORD: '/forgot-password',
    CHANGE_PASSWORD: '/change-password',
    KYC_UPLOAD: '/kycUpload',
    VENDOR_DETAILS: '/vendorDetails',
    EDIT_PROFILE: '/edit-profile',
    ADD_HOSTEL: '/addHostel',
    CHANGE_PASSWORD_NEW: '/changePassword',
    TOKEN: '/token',
    RESEND_OTP: '/resend-otp',
    GET_HOSTELS: '/getAllHostels/:page',
    GET_HOSTEL: '/getHostel/:id',
    EDIT_HOSTEL:'/editHostel/:id'
  };
  