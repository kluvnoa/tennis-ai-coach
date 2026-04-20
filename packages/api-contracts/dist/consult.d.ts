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
export declare const AdviceImageRequestSchema: z.ZodObject<{
    question: z.ZodString;
    answer: z.ZodString;
    level: z.ZodOptional<z.ZodString>;
    playStyle: z.ZodOptional<z.ZodString>;
    variant: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    question: string;
    answer: string;
    variant: number;
    level?: string | undefined;
    playStyle?: string | undefined;
}, {
    question: string;
    answer: string;
    level?: string | undefined;
    playStyle?: string | undefined;
    variant?: number | undefined;
}>;
export declare const AdviceImageSchema: z.ZodObject<{
    imageDataUrl: z.ZodString;
    alt: z.ZodString;
    prompt: z.ZodString;
    variant: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    variant: number;
    imageDataUrl: string;
    alt: string;
    prompt: string;
}, {
    variant: number;
    imageDataUrl: string;
    alt: string;
    prompt: string;
}>;
export declare const AdviceImageResponseSchema: z.ZodObject<{
    visual: z.ZodObject<{
        imageDataUrl: z.ZodString;
        alt: z.ZodString;
        prompt: z.ZodString;
        variant: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        variant: number;
        imageDataUrl: string;
        alt: string;
        prompt: string;
    }, {
        variant: number;
        imageDataUrl: string;
        alt: string;
        prompt: string;
    }>;
}, "strip", z.ZodTypeAny, {
    visual: {
        variant: number;
        imageDataUrl: string;
        alt: string;
        prompt: string;
    };
}, {
    visual: {
        variant: number;
        imageDataUrl: string;
        alt: string;
        prompt: string;
    };
}>;
export type ConsultHistoryItem = z.infer<typeof ConsultHistoryItemSchema>;
export type HistoryResponse = z.infer<typeof HistoryResponseSchema>;
export type CreateConsultRequest = z.infer<typeof CreateConsultRequestSchema>;
export type CreateConsultResponse = z.infer<typeof CreateConsultResponseSchema>;
export type AdviceRequest = z.infer<typeof AdviceRequestSchema>;
export type AdviceResponse = z.infer<typeof AdviceResponseSchema>;
export type AdviceImageRequest = z.infer<typeof AdviceImageRequestSchema>;
export type AdviceImageResponse = z.infer<typeof AdviceImageResponseSchema>;
