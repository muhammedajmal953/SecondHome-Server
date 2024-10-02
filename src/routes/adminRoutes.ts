import { Request, Response, Router } from "express";
import { AdminController } from "../controllers/adminController";
import { AdminServices } from "../services/adminSevices";
import UserRepository from "../repositories/userRepository";
const adminRouter = Router();

const userRepository = new UserRepository();
const adminService= new AdminServices(userRepository);
const adminController = new AdminController(adminService);

adminRouter.post('/login', adminController.loginAdmin.bind(adminController))
adminRouter.get('/getAllUsers/:page/:limit', adminController.getAllUsers.bind(adminController))
adminRouter.put('/blockUser', adminController.blockUser.bind(adminController))
adminRouter.put('/unBlockUser', adminController.unBlockUser.bind(adminController))

adminRouter.get('/getAllVendors/:page/:limit',adminController.getAllVendors.bind(adminController))

export default adminRouter