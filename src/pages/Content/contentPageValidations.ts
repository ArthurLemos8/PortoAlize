import { z } from "zod";

export const contentSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  descricao: z.string().min(1, "Informe a descrição"),
  autor: z.string().min(1, "Informe o autor"),
  data: z.string().min(1, "Informe a data"),
  foto: z.string().min(1, "Informe a foto"),
});

export type ContentValues = z.infer<typeof contentSchema>;
