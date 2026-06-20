import logger from "#config/logger.js";
import {
  deleteUser as deleteUserService,
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
} from "#services/user.service.js";
import { userIdSchema, updateUserSchema } from "#validations/users.validation.js";
import { formatValidationsError } from "#utils/format.js";
import { cookies } from "#utils/cookies.js";
import { jwtToken } from "#utils/jwt.js";

const getAuthenticatedUser = req => {
  const token = cookies.get(req, "token");

  if (!token) {
    throw new Error("Unauthorized");
  }

  return jwtToken.verify(token);
};

const canManageUser = (authUser, userId) => {
  return authUser.role === "admin" || Number(authUser.id) === Number(userId);
};

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info("Getting users...");

    const allUsers = await getAllUsers();
    res.json({
      message: "Successfully retrieved users",
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    logger.info(`Getting user with id ${req.params.id}`);

    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Successfully retrieved user",
      user,
    });
  } catch (error) {
    logger.error("Get user by id error", error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    logger.info(`Updating user with id ${req.params.id}`);

    const idValidationResult = userIdSchema.safeParse(req.params);

    if (!idValidationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatValidationsError(idValidationResult.error),
      });
    }

    const bodyValidationResult = updateUserSchema.safeParse(req.body);

    if (!bodyValidationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatValidationsError(bodyValidationResult.error),
      });
    }

    const authUser = getAuthenticatedUser(req);
    const { id } = idValidationResult.data;

    if (!canManageUser(authUser, id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updates = { ...bodyValidationResult.data };

    if (updates.role && authUser.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update user roles" });
    }

    const user = await updateUserService(id, updates);

    return res.status(200).json({
      message: "Successfully updated user",
      user,
    });
  } catch (error) {
    logger.error("Update user error", error);

    if (error.message === "Unauthorized" || error.message === "Error verifying JWT token") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (error.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }

    if (error.message === "Email already exists") {
      return res.status(409).json({ error: "Email already exists" });
    }

    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    logger.info(`Deleting user with id ${req.params.id}`);

    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatValidationsError(validationResult.error),
      });
    }

    const authUser = getAuthenticatedUser(req);
    const { id } = validationResult.data;

    if (!canManageUser(authUser, id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await deleteUserService(id);

    return res.status(200).json({
      message: "Successfully deleted user",
      user,
    });
  } catch (error) {
    logger.error("Delete user error", error);

    if (error.message === "Unauthorized" || error.message === "Error verifying JWT token") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (error.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }

    next(error);
  }
};
