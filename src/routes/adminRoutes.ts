import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { AdminServices } from "../services/adminSevices";
import UserRepository from "../repositories/userRepository";
import { adminAuth } from "../middlewares/adminAuthMiddleWare";
import { HostelRepository } from "../repositories/hostelRepository";
import { HostelService } from "../services/hostelService";
import { HostelController } from "../controllers/hostelController";
import { Admin_Routes } from "../constants/routes-constants";
import { BookingRepository } from "../repositories/bookingRepository";

const adminRouter = Router();
const hostelRepository = new HostelRepository();
const userRepository = new UserRepository();
const bookingRepository=new BookingRepository()

const adminService = new AdminServices(userRepository,hostelRepository,bookingRepository);
const adminController = new AdminController(adminService);
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
  adminController.getAllHostel.bind(adminController)
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

adminRouter.get(
  Admin_Routes.GET_ALL_BOOKINGS,
  adminAuth,
  adminController.getAllBooking.bind(adminController)
)

adminRouter.get(
  Admin_Routes.GET_ALL_DATAS,
  adminAuth,
  adminController.getAllDatas.bind(adminController)
)

export default adminRouter;
