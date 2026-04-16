import { z } from "zod";

export const IsoDateTimeSchema = z
  .union([z.string().datetime({ offset: true }), z.date()])
  .transform((value: string | Date) =>
    value instanceof Date ? value.toISOString() : value,
  );

export const ConsultHistoryItemSchema = z.object({
  id: z.string(),
  createdAt: IsoDateTimeSchema,
  userMessage: z.string(),
  aiMessage: z.string(),
});

export const HistoryResponseSchema = z.array(ConsultHistoryItemSchema);

export const CreateConsultRequestSchema = z.object({
  userMessage: z.string().trim().min(1),
  aiMessage: z.string().trim().min(1),
});

export const CreateConsultResponseSchema = ConsultHistoryItemSchema;

export const AdviceRequestSchema = z.object({
  question: z.string().trim().min(1),
  level: z.string().trim().min(1).optional(),
  playStyle: z.string().trim().min(1).optional(),
});

export const AdviceResponseSchema = z.object({
  answer: z.string(),
});

export type ConsultHistoryItem = z.infer<typeof ConsultHistoryItemSchema>;
export type HistoryResponse = z.infer<typeof HistoryResponseSchema>;
export type CreateConsultRequest = z.infer<typeof CreateConsultRequestSchema>;
export type CreateConsultResponse = z.infer<typeof CreateConsultResponseSchema>;
export type AdviceRequest = z.infer<typeof AdviceRequestSchema>;
export type AdviceResponse = z.infer<typeof AdviceResponseSchema>;
