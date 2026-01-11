// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type HistoryItem = {
  id: string;
  createdAt: string;
  userMessage: string;
  aiMessage: string;
};

export type AdviceRequest = {
  question: string;
  level: string;
  playStyle: string;
};

export type AdviceResponse = {
  answer: string;
};

// Fetch history
export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE_URL}/consult/history`);
  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }
  return res.json();
}

// Fetch advice
export async function fetchAdvice(request: AdviceRequest): Promise<AdviceResponse> {
  const res = await fetch(`${API_BASE_URL}/consult/advice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? data.error ?? "A server error occurred");
  }

  return res.json();
}
