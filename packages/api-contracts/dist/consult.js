"use strict";

const { z } = require("zod");

const IsoDateTimeSchema = z
  .union([z.string().datetime({ offset: true }), z.date()])
  .transform((value) => (value instanceof Date ? value.toISOString() : value));

const ConsultHistoryItemSchema = z.object({
  id: z.string(),
  createdAt: IsoDateTimeSchema,
  userMessage: z.string(),
  aiMessage: z.string(),
});

const HistoryResponseSchema = z.array(ConsultHistoryItemSchema);

const CreateConsultRequestSchema = z.object({
  userMessage: z.string().trim().min(1),
  aiMessage: z.string().trim().min(1),
});

const CreateConsultResponseSchema = ConsultHistoryItemSchema;

const AdviceRequestSchema = z.object({
  question: z.string().trim().min(1),
  level: z.string().trim().min(1).optional(),
  playStyle: z.string().trim().min(1).optional(),
});

const AdviceResponseSchema = z.object({
  answer: z.string(),
});

module.exports = {
  AdviceRequestSchema,
  AdviceResponseSchema,
  ConsultHistoryItemSchema,
  CreateConsultRequestSchema,
  CreateConsultResponseSchema,
  HistoryResponseSchema,
  IsoDateTimeSchema,
};
