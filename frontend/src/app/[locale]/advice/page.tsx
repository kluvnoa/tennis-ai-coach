// app/[locale]/advice/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { fetchHistory, fetchAdvice, type HistoryItem } from "@/lib/api";
import LocaleSwitcher from "@/components/LocaleSwitcher";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const levelKeys = ["beginner", "intermediate", "advanced"] as const;
const playStyleKeys = [
  "all-round",
  "baseline",
  "serve-and-volley",
  "counter-puncher",
] as const;

export default function AdvicePage() {
  const t = useTranslations();
  const locale = useLocale();

  const [question, setQuestion] = useState("");
  const [level, setLevel] = useState<string>("intermediate");
  const [playStyle, setPlayStyle] = useState<string>("baseline");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const queryClient = useQueryClient();

  // Fetch history (useQuery) - enabled: false for manual execution
  const {
    data: history = [],
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery<HistoryItem[]>({
    queryKey: ["history"],
    queryFn: fetchHistory,
    enabled: false, // Only execute on button click
  });

  // Fetch advice (useMutation)
  const adviceMutation = useMutation({
    mutationFn: fetchAdvice,
    onSuccess: (data) => {
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setQuestion("");
      // Invalidate history to fetch latest data on next request
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });

  async function handleHistoryClick() {
    await refetchHistory();
    setShowHistory(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);

    adviceMutation.mutate({
      question,
      level,
      playStyle,
    });
  }

  const error =
    adviceMutation.error?.message ||
    (historyError instanceof Error ? historyError.message : null);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex justify-center">
      <div className="w-full max-w-3xl px-4 py-8">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold">
            {t("advice.title")}{" "}
            <span className="text-sm font-normal ml-2">
              {t("advice.version")}
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <button
            onClick={handleHistoryClick}
            disabled={historyLoading}
            className="inline-flex items-center rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-60 px-3 py-1.5 text-sm font-medium transition"
          >
            {historyLoading ? t("advice.loading") : `📜 ${t("advice.history")}`}
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-300 mb-6">{t("advice.description")}</p>

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700">
                <h2 className="text-lg font-bold">{t("advice.historyTitle")}</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-4 flex-1">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-400">{t("advice.noHistory")}</p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-700 rounded-lg p-3 space-y-2"
                    >
                      <div className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleString(
                          locale === "ja" ? "ja-JP" : "en-US"
                        )}
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-sky-400 mb-1">
                          {t("advice.question")}
                        </div>
                        <div className="text-slate-300 whitespace-pre-wrap">
                          {item.userMessage}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-emerald-400 mb-1">
                          {t("advice.answer")}
                        </div>
                        <div className="text-slate-300 whitespace-pre-wrap">
                          {item.aiMessage}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Player Settings */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border border-slate-800 rounded-xl p-4 mb-6 bg-slate-900/60"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              {t("advice.level")}
              <select
                className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {levelKeys.map((key) => (
                  <option key={key} value={key}>
                    {t(`levels.${key}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              {t("advice.playStyle")}
              <select
                className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                value={playStyle}
                onChange={(e) => setPlayStyle(e.target.value)}
              >
                {playStyleKeys.map((key) => (
                  <option key={key} value={key}>
                    {t(`playStyles.${key}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="text-sm block">
            {t("advice.questionLabel")}
            <textarea
              className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm min-h-[90px]"
              placeholder={t("advice.placeholder")}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>

          {error && (
            <p className="text-sm text-red-400">
              {t("advice.error")} {error}
            </p>
          )}

          <button
            type="submit"
            disabled={adviceMutation.isPending}
            className="inline-flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 px-4 py-2 text-sm font-medium transition"
          >
            {adviceMutation.isPending ? t("advice.thinking") : t("advice.submit")}
          </button>
        </form>

        {/* Chat Log */}
        <div className="space-y-4">
          {messages.length === 0 && (
            <p className="text-sm text-slate-400">{t("advice.noMessages")}</p>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`rounded-xl border px-4 py-3 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "border-sky-700 bg-sky-950/60"
                  : "border-emerald-700 bg-emerald-950/60"
              }`}
            >
              <div className="mb-1 text-xs font-semibold text-slate-300">
                {m.role === "user" ? t("advice.you") : t("advice.aiCoach")}
              </div>
              <div>{m.content}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
