import {
  deleteUser,
  fetchAllUsers,
  getUserById,
  updateUser,
} from "#controllers/user.controller.js";
import express from "express";

const router = express.Router();

router.get("/", fetchAllUsers);

router.get("/:id", getUserById);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;
