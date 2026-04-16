import { z } from "zod";
export declare const IsoDateTimeSchema: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
export declare const ConsultHistoryItemSchema: z.ZodObject<{
    id: z.ZodString;
    createdAt: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    userMessage: z.ZodString;
    aiMessage: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    userMessage: string;
    aiMessage: string;
}, {
    id: string;
    createdAt: string | Date;
    userMessage: string;
    aiMessage: string;
}>;
export declare const HistoryResponseSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    createdAt: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    userMessage: z.ZodString;
    aiMessage: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    userMessage: string;
    aiMessage: string;
}, {
    id: string;
    createdAt: string | Date;
    userMessage: string;
    aiMessage: string;
}>, "many">;
export declare const CreateConsultRequestSchema: z.ZodObject<{
    userMessage: z.ZodString;
    aiMessage: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userMessage: string;
    aiMessage: string;
}, {
    userMessage: string;
    aiMessage: string;
}>;
export declare const CreateConsultResponseSchema: z.ZodObject<{
    id: z.ZodString;
    createdAt: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    userMessage: z.ZodString;
    aiMessage: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    userMessage: string;
    aiMessage: string;
}, {
    id: string;
    createdAt: string | Date;
    userMessage: string;
    aiMessage: string;
}>;
export declare const AdviceRequestSchema: z.ZodObject<{
    question: z.ZodString;
    level: z.ZodOptional<z.ZodString>;
    playStyle: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    question: string;
    level?: string | undefined;
    playStyle?: string | undefined;
}, {
    question: string;
    level?: string | undefined;
    playStyle?: string | undefined;
}>;
export declare const AdviceResponseSchema: z.ZodObject<{
    answer: z.ZodString;
}, "strip", z.ZodTypeAny, {
    answer: string;
}, {
    answer: string;
}>;
export type ConsultHistoryItem = z.infer<typeof ConsultHistoryItemSchema>;
export type HistoryResponse = z.infer<typeof HistoryResponseSchema>;
export type CreateConsultRequest = z.infer<typeof CreateConsultRequestSchema>;
export type CreateConsultResponse = z.infer<typeof CreateConsultResponseSchema>;
export type AdviceRequest = z.infer<typeof AdviceRequestSchema>;
export type AdviceResponse = z.infer<typeof AdviceResponseSchema>;
