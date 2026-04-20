import {
  AdviceImageRequestSchema,
  AdviceImageResponseSchema,
  AdviceRequestSchema,
  AdviceResponseSchema,
  HistoryResponseSchema,
  type AdviceImageRequest,
  type AdviceImageResponse,
  type AdviceRequest,
  type AdviceResponse,
  type ConsultHistoryItem as HistoryItem,
} from "@tennis-ai-coach/api-contracts/consult";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type SchemaParser<T> = {
  parse: (value: unknown) => T;
};

async function parseJson<T>(response: Response, schema: SchemaParser<T>): Promise<T> {
  return schema.parse(await response.json());
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE_URL}/consult/history`);
  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }
  return parseJson(res, HistoryResponseSchema);
}

export async function fetchAdvice(request: AdviceRequest): Promise<AdviceResponse> {
  const payload = AdviceRequestSchema.parse(request);
  const res = await fetch(`${API_BASE_URL}/consult/advice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? data.error ?? "A server error occurred");
  }

  return parseJson(res, AdviceResponseSchema);
}

export async function fetchAdviceImage(
  request: AdviceImageRequest,
): Promise<AdviceImageResponse> {
  const payload = AdviceImageRequestSchema.parse(request);
  const res = await fetch(`${API_BASE_URL}/consult/advice-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? data.error ?? "A server error occurred");
  }

  return parseJson(res, AdviceImageResponseSchema);
}

export type {
  AdviceImageRequest,
  AdviceImageResponse,
  AdviceRequest,
  AdviceResponse,
  HistoryItem,
};
