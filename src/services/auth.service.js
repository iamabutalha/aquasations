import logger from "#config/logger.js";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "#config/database.js";
import { users } from "#models/user.model.js";
export const hashPassword = async password => {
  try {
    const saltRounds = Number(
      process.env.SALT_ROUNDS || process.env.SALT || 10
    );

    if (!Number.isInteger(saltRounds) || saltRounds < 1) {
      throw new Error("Invalid bcrypt salt rounds");
    }

    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    logger.error(`Error Hashing password ${error}`);
    throw new Error("Error hashing", { cause: error });
  }
};
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error(`Error comparing password ${error}`);
    throw new Error("Error comparing password", { cause: error });
  }
};

export const createUser = async ({ name, email, password, role }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("User already exists");
    }

    const password_hash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    logger.info(`User with ${email} created successfully`);

    return newUser;
  } catch (error) {
    logger.error(`Error creating the user ${error}`);
    throw new Error("Error creating user", { cause: error });
  }
};

export const authenticateUser = async (email, password) => {
  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) {
      throw new Error("User not found");
    }

    const isValidPassword = await comparePassword(
      password,
      existingUser.password
    );

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    return {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      created_at: existingUser.created_at,
    };
  } catch (error) {
    logger.error(`Error authenticating user ${error}`);

    if (error.message === "User not found") {
      throw error;
    }

    if (error.message === "Invalid credentials") {
      throw error;
    }

    throw new Error("Error authenticating user", { cause: error });
  }
};
