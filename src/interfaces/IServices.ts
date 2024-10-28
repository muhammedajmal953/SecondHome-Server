import { IResponse } from "./IResponse";
import { UserDoc } from "./IUser";

export interface IAdminService {
  loginUser(admin: Partial<UserDoc>): Promise<IResponse>;
  getAllUsers(name: string, page: number, limit: number): Promise<IResponse>;
  getAllVendors(name: string, page: number, limit: number): Promise<IResponse>;
  blockUser(id: string): Promise<IResponse>;
  unBlockUser(id: string): Promise<IResponse>;
  verifyVendor(_id: string): Promise<IResponse>;
  refreshToken(token: string): Promise<IResponse>;
  getAllHostel(page: number, searchQuery: string): Promise<IResponse>;
}

export interface IUserSrvice {
  createUser(user: UserDoc): Promise<IResponse>;
  verifyUser(otp: string, email: string): Promise<IResponse>;
  singleSignIn(idToken: string): Promise<IResponse>;
  loginUser(user: { [key: string]: unknown }): Promise<IResponse>;
  forgotPassword(email: string): Promise<IResponse>;
  forgotOtpHandle(email: string, otp: string): Promise<IResponse>;
  changePassword(
    email: string,
    password: { newPassword: string; confirmPassword: string }
  ): Promise<IResponse>;
  getUser(token: string): Promise<IResponse>;
  editProfile(
    token: string,
    updates: { [key: string]: unknown },
    file: Express.Multer.File
  ): Promise<IResponse>;
  newPassWord(
    data: { [key: string]: string },
    token: string
  ): Promise<IResponse>;
  refreshToken(token: string): Promise<IResponse>;
  resendOtp(email: string): Promise<IResponse>;
}



export interface IVendorService{
    createVendor(user: UserDoc): Promise<IResponse>;
    verifyVendor(otp: string, email: string): Promise<IResponse>;
    singleSignInVendor(idToken: string): Promise<IResponse>;
    loginVendor(user: {[key:string]:string}): Promise<IResponse>;
    forgotPassword(email: string): Promise<IResponse>;
    changePasswordVendor(email: string, password: {[key:string]:string}): Promise<IResponse>;
    forgotOtpHandler(email: string, otp: string): Promise<IResponse>;
    kycUpload(email: string, file: Express.Multer.File): Promise<IResponse>;
    getVendorDtails(token: string) : Promise<IResponse>;
    editProfile(token: string, updates: {[key:string]:unknown}, file: Express.Multer.File): Promise<IResponse>;
    newPassWord(data:{oldPassword:string,newPassword:string}, token: string): Promise<IResponse>;
    refreshToken(token:string): Promise<IResponse>;
    resendOtp(email: string): Promise<IResponse>;
    getAllHostels(page: number, searchQuery: string, token: string): Promise<IResponse>;
}

export interface IWishlistService{
  addToWish(id: string,hostelId:string): Promise<IResponse>;
  getAllWishList(page: number, searchQuery: string, id: string): Promise<IResponse>;
  removeFromWishList(id:string,userId:string):Promise<IResponse>
}



