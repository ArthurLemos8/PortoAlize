import { z } from "zod";

const horarioDiaSchema = z.object({
  abre: z.string().min(1, "Obrigatório"),
  fecha: z.string().min(1, "Obrigatório"),
});

export const estabelecimentoSchema = z.object({
  nome: z.string().min(3, "Nome deve conter no mínimo 3 caracteres"),
  ativo: z.boolean().default(true),
  categoria: z.string().min(1, "Selecione uma categoria"),
  cidade: z.string().min(1, "Selecione uma cidade"), 
  descricao: z.string().min(5, "Descrição muito curta"),
  endereco: z.string().min(5, "Endereço obrigatório"),
  telefone: z.string().min(8, "Telefone inválido"),
  
  horario_funcionamento: z.object({
    segunda: horarioDiaSchema,
    terça: horarioDiaSchema,
    quarta: horarioDiaSchema,
    quinta: horarioDiaSchema,
    sexta: horarioDiaSchema,
    sábado: horarioDiaSchema,
    domingo: horarioDiaSchema,
  }),
});

export type EstabelecimentoFormData = z.infer<typeof estabelecimentoSchema>;