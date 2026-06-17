import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3).max(255).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(128),
  role: z.enum(["user", "admin"]).default("user"),
});

export const signInSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});
