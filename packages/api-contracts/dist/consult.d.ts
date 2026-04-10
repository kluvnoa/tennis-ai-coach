import { z } from "zod";

export declare const IsoDateTimeSchema: z.ZodEffects<
  z.ZodUnion<[z.ZodString, z.ZodDate]>,
  string,
  string | Date
>;
export declare const ConsultHistoryItemSchema: z.ZodObject<{
  id: z.ZodString;
  createdAt: typeof IsoDateTimeSchema;
  userMessage: z.ZodString;
  aiMessage: z.ZodString;
}>;
export declare const HistoryResponseSchema: z.ZodArray<typeof ConsultHistoryItemSchema>;
export declare const CreateConsultRequestSchema: z.ZodObject<{
  userMessage: z.ZodString;
  aiMessage: z.ZodString;
}>;
export declare const CreateConsultResponseSchema: typeof ConsultHistoryItemSchema;
export declare const AdviceRequestSchema: z.ZodObject<{
  question: z.ZodString;
  level: z.ZodOptional<z.ZodString>;
  playStyle: z.ZodOptional<z.ZodString>;
}>;
export declare const AdviceResponseSchema: z.ZodObject<{
  answer: z.ZodString;
}>;

export type ConsultHistoryItem = z.infer<typeof ConsultHistoryItemSchema>;
export type HistoryResponse = z.infer<typeof HistoryResponseSchema>;
export type CreateConsultRequest = z.infer<typeof CreateConsultRequestSchema>;
export type CreateConsultResponse = z.infer<typeof CreateConsultResponseSchema>;
export type AdviceRequest = z.infer<typeof AdviceRequestSchema>;
export type AdviceResponse = z.infer<typeof AdviceResponseSchema>;
