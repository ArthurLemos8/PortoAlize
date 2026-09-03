import { z } from "zod";

export const subCategorySchema = z.object({
  nome: z.string().min(1, "O nome da subcategoria é obrigatório"),
  categoriaId: z.string().min(1, "Selecione a categoria principal"),
});

export type SubCategoryFormData = z.infer<typeof subCategorySchema>;
