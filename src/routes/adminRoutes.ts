import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { AdminServices } from "../services/adminSevices";
import UserRepository from "../repositories/userRepository";
import { adminAuth } from "../middlewares/adminAuthMiddleWare";
import { HostelRepository } from "../repositories/hostelRepository";
import { HostelService } from "../services/hostelService";
import { HostelController } from "../controllers/hostelController";
import { Admin_Routes } from "../constants/routes-constants";

const adminRouter = Router();

const userRepository = new UserRepository();
const adminService = new AdminServices(userRepository);
const adminController = new AdminController(adminService);
const hostelRepository = new HostelRepository();
const hostelService = new HostelService(hostelRepository);
const hostelController = new HostelController(hostelService);

adminRouter.post(
  Admin_Routes.Login,
  adminController.loginAdmin.bind(adminController)
);

adminRouter.get(
  Admin_Routes.Get_All_Users,
  adminController.getAllUsers.bind(adminController)
);
adminRouter.put(
  Admin_Routes.BLOCK_USER,
  adminAuth,
  adminController.blockUser.bind(adminController)
);
adminRouter.put(
  Admin_Routes.UNBLOCK_USER,
  adminAuth,
  adminController.unBlockUser.bind(adminController)
);

adminRouter.get(
  Admin_Routes.GET_ALL_VENDORS,
  adminController.getAllVendors.bind(adminController)
);

adminRouter.put(
  Admin_Routes.VERIFY_VENDOR,
  adminAuth,
  adminController.verifyVendor.bind(adminController)
);

adminRouter.get(
  Admin_Routes.GET_ALL_HOSTELS,
  adminAuth,
  hostelController.getAllHostel.bind(hostelController)
);

adminRouter.get(Admin_Routes.REFRESH_TOKEN, adminController.refreshToken.bind(adminController));

adminRouter.put(
  Admin_Routes.BLOCK_HOSTEL,
  adminAuth,
  hostelController.blockHostel.bind(hostelController)
);
adminRouter.put(
  Admin_Routes.UNBLOCK_HOSTEL,
  adminAuth,
  hostelController.unBlockHostel.bind(hostelController)
);

export default adminRouter;
