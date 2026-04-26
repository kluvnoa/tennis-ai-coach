"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdviceImageResponseSchema = exports.AdviceImageSchema = exports.AdviceImageStepSchema = exports.AdviceImageRequestSchema = exports.AdviceResponseSchema = exports.AdviceRequestSchema = exports.CreateConsultResponseSchema = exports.CreateConsultRequestSchema = exports.HistoryResponseSchema = exports.ConsultHistoryItemSchema = exports.IsoDateTimeSchema = void 0;
const zod_1 = require("zod");
exports.IsoDateTimeSchema = zod_1.z
    .union([zod_1.z.string().datetime({ offset: true }), zod_1.z.date()])
    .transform((value) => value instanceof Date ? value.toISOString() : value);
exports.ConsultHistoryItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    createdAt: exports.IsoDateTimeSchema,
    userMessage: zod_1.z.string(),
    aiMessage: zod_1.z.string(),
});
exports.HistoryResponseSchema = zod_1.z.array(exports.ConsultHistoryItemSchema);
exports.CreateConsultRequestSchema = zod_1.z.object({
    userMessage: zod_1.z.string().trim().min(1),
    aiMessage: zod_1.z.string().trim().min(1),
});
exports.CreateConsultResponseSchema = exports.ConsultHistoryItemSchema;
exports.AdviceRequestSchema = zod_1.z.object({
    question: zod_1.z.string().trim().min(1),
    level: zod_1.z.string().trim().min(1).optional(),
    playStyle: zod_1.z.string().trim().min(1).optional(),
});
exports.AdviceResponseSchema = zod_1.z.object({
    answer: zod_1.z.string(),
});
exports.AdviceImageRequestSchema = zod_1.z.object({
    question: zod_1.z.string().trim().min(1),
    answer: zod_1.z.string().trim().min(1),
    level: zod_1.z.string().trim().min(1).optional(),
    playStyle: zod_1.z.string().trim().min(1).optional(),
    variant: zod_1.z.number().int().min(1).optional().default(1),
});
exports.AdviceImageStepSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1),
    focus: zod_1.z.string().trim().min(1),
});
exports.AdviceImageSchema = zod_1.z.object({
    imageDataUrl: zod_1.z.string().trim().min(1),
    alt: zod_1.z.string().trim().min(1),
    prompt: zod_1.z.string().trim().min(1),
    variant: zod_1.z.number().int().min(1),
    layout: zod_1.z.literal("sequence"),
    steps: zod_1.z.array(exports.AdviceImageStepSchema).min(3).max(4),
});
exports.AdviceImageResponseSchema = zod_1.z.object({
    visual: exports.AdviceImageSchema,
});
