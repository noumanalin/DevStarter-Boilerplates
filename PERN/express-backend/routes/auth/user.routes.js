import express from "express";
import multer from "multer";
import isLoggedIn from "../../middlewares/isLoggedIn.js";
import upload from "../../middlewares/upload.middleware.js";
import {
  getProfile, updateProfile, getLoginHistory,
  getAllUsers, getUserById, updateUserRole,
  updateUserStatus, deleteUser,
} from "../../controllers/auth/user.controller.js";

const router = express.Router(); 

router.get("/profile",        isLoggedIn(),                                    getProfile);
router.put("/profile",        isLoggedIn(), upload.single("avatar"),           updateProfile);
router.get("/login-history",  isLoggedIn(),                                    getLoginHistory);

router.get("/",               isLoggedIn(["ADMIN", "SUPER_ADMIN"]),            getAllUsers);
router.get("/:id",            isLoggedIn(["ADMIN", "SUPER_ADMIN"]),            getUserById);
router.patch("/:id/role",     isLoggedIn(["SUPER_ADMIN"]),                     updateUserRole);
router.patch("/:id/status",   isLoggedIn(["ADMIN", "SUPER_ADMIN"]),            updateUserStatus);
router.delete("/:id",         isLoggedIn(["SUPER_ADMIN"]),                     deleteUser);

export default router;