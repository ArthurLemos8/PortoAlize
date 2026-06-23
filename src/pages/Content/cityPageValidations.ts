import { z } from "zod";

export const cidadeSchema = z.object({
  nome: z.string().min(3, "O nome da cidade deve conter no mínimo 3 caracteres"),
  estado: z.string().min(2, "Digite a sigla do estado (ex: SP)").max(2, "Apenas 2 letras para o estado"),
});

export type CidadeFormData = z.infer<typeof cidadeSchema>;