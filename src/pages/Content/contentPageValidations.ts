import { z } from "zod";

export const contentSchema = z.object({
  username: z.string().min(5, "Nome deve conter no minimo 5 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve conter no minimo 10 caracteres"),
});

export type ContentValues = z.infer<typeof contentSchema>;
