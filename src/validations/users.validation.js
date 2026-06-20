import { z } from "zod";

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(3).max(255).trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
    password: z.string().min(6).max(128).optional(),
    role: z.enum(["user", "admin"]).optional(),
  })
  .strict()
  .refine(data => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
