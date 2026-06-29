import {z} from "zod";

export const categorySchema = z.object({
    nome: z.string().min(5, "O nome da categoria deve conter no mínimo 5 caracteres"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;