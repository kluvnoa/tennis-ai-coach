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

export const AdviceImageRequestSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
  level: z.string().trim().min(1).optional(),
  playStyle: z.string().trim().min(1).optional(),
  variant: z.number().int().min(1).optional().default(1),
});

export const AdviceImageSchema = z.object({
  imageDataUrl: z.string().trim().min(1),
  alt: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  variant: z.number().int().min(1),
});

export const AdviceImageResponseSchema = z.object({
  visual: AdviceImageSchema,
});

export type ConsultHistoryItem = z.infer<typeof ConsultHistoryItemSchema>;
export type HistoryResponse = z.infer<typeof HistoryResponseSchema>;
export type CreateConsultRequest = z.infer<typeof CreateConsultRequestSchema>;
export type CreateConsultResponse = z.infer<typeof CreateConsultResponseSchema>;
export type AdviceRequest = z.infer<typeof AdviceRequestSchema>;
export type AdviceResponse = z.infer<typeof AdviceResponseSchema>;
export type AdviceImageRequest = z.infer<typeof AdviceImageRequestSchema>;
export type AdviceImageResponse = z.infer<typeof AdviceImageResponseSchema>;
