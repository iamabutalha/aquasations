import { db } from "#config/database.js";
import logger from "#config/logger.js";
import { users } from "#models/user.model.js";
import { hashPassword } from "#services/auth.service.js";
import { and, eq, ne } from "drizzle-orm";

const userColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  created_at: users.created_at,
  updated_at: users.updated_at,
};

export const getAllUsers = async () => {
  try {
    return await db.select(userColumns).from(users);
  } catch (error) {
    logger.error("Error getting users", error);
    throw error;
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select(userColumns)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user;
  } catch (error) {
    logger.error(`Error getting user with id ${id}`, error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      throw new Error("User not found");
    }

    if (updates.email) {
      const [existingEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, updates.email), ne(users.id, id)))
        .limit(1);

      if (existingEmail) {
        throw new Error("Email already exists");
      }
    }

    const updateData = { ...updates, updated_at: new Date() };

    if (updates.password) {
      updateData.password = await hashPassword(updates.password);
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning(userColumns);

    return updatedUser;
  } catch (error) {
    logger.error(`Error updating user with id ${id}`, error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      throw new Error("User not found");
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning(userColumns);

    return deletedUser;
  } catch (error) {
    logger.error(`Error deleting user with id ${id}`, error);
    throw error;
  }
};
