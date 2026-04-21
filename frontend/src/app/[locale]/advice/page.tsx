// app/[locale]/advice/page.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import {
  fetchHistory,
  fetchAdvice,
  fetchAdviceImage,
  type HistoryItem,
} from "@/lib/api";
import LocaleSwitcher from "@/components/LocaleSwitcher";

type AdviceContext = {
  question: string;
  level: string;
  playStyle: string;
};

type AssistantVisual = {
  status: "loading" | "ready" | "error";
  variant: number;
  imageDataUrl?: string;
  alt?: string;
  layout?: "sequence";
  steps?: Array<{
    title: string;
    focus: string;
  }>;
  error?: string;
};

type UserMessage = {
  id: string;
  role: "user";
  content: string;
};

type AssistantMessage = {
  id: string;
  role: "assistant";
  content: string;
  context: AdviceContext;
  visual?: AssistantVisual;
};

type Message = UserMessage | AssistantMessage;

const levelKeys = ["beginner", "intermediate", "advanced"] as const;
const playStyleKeys = [
  "all-round",
  "baseline",
  "serve-and-volley",
  "counter-puncher",
] as const;

function createMessageId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function isAssistantMessage(message: Message): message is AssistantMessage {
  return message.role === "assistant";
}

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });

  function updateAssistantMessage(
    messageId: string,
    updater: (message: AssistantMessage) => AssistantMessage,
  ) {
    setMessages((prev) =>
      prev.map((message) => {
        if (!isAssistantMessage(message) || message.id !== messageId) {
          return message;
        }

        return updater(message);
      }),
    );
  }

  async function generateAdviceIllustration(
    messageId: string,
    context: AdviceContext,
    answer: string,
    variant: number,
  ) {
    updateAssistantMessage(messageId, (message) => ({
      ...message,
      visual: {
        ...message.visual,
        status: "loading",
        variant,
        error: undefined,
      },
    }));

    try {
      const response = await fetchAdviceImage({
        question: context.question,
        answer,
        level: context.level,
        playStyle: context.playStyle,
        variant,
      });

      updateAssistantMessage(messageId, (message) => ({
        ...message,
        visual: {
          status: "ready",
          variant: response.visual.variant,
          imageDataUrl: response.visual.imageDataUrl,
          alt: response.visual.alt,
          layout: response.visual.layout,
          steps: response.visual.steps,
        },
      }));
    } catch (error) {
      updateAssistantMessage(messageId, (message) => ({
        ...message,
        visual: {
          ...message.visual,
          status: "error",
          variant,
          error: error instanceof Error ? error.message : t("advice.imageError"),
        },
      }));
    }
  }

  async function handleHistoryClick() {
    await refetchHistory();
    setShowHistory(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    const userMessage: UserMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedQuestion,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const data = await adviceMutation.mutateAsync({
        question: trimmedQuestion,
        level,
        playStyle,
      });

      const assistantMessageId = createMessageId();
      const context: AdviceContext = {
        question: trimmedQuestion,
        level,
        playStyle,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: data.answer,
          context,
          visual: {
            status: "loading",
            variant: 1,
          },
        },
      ]);
      setQuestion("");

      void generateAdviceIllustration(
        assistantMessageId,
        context,
        data.answer,
        1,
      );
    } catch {
      return;
    }
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

          {messages.map((m) => (
            <div
              key={m.id}
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

              {isAssistantMessage(m) && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                      {t("advice.illustration")}
                    </div>

                    {m.visual?.status === "loading" && (
                      <p className="text-sm text-slate-300">
                        {t("advice.imageLoading")}
                      </p>
                    )}

                    {m.visual?.status === "error" && (
                      <p className="text-sm text-red-300">
                        {t("advice.imageError")}{" "}
                        {m.visual.error ? `(${m.visual.error})` : ""}
                      </p>
                    )}

                    {m.visual?.imageDataUrl && (
                      <div className="space-y-3">
                        <Image
                          src={m.visual.imageDataUrl}
                          alt={m.visual.alt ?? t("advice.illustration")}
                          width={1360}
                          height={720}
                          unoptimized
                          className="w-full rounded-lg border border-slate-700"
                        />

                        {m.visual.layout === "sequence" &&
                          m.visual.steps &&
                          m.visual.steps.length > 0 && (
                            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                                {t("advice.motionSteps")}
                              </div>
                              <div className="space-y-2">
                                {m.visual.steps.map((step, index) => (
                                  <div
                                    key={`${m.id}-step-${index}`}
                                    className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"
                                  >
                                    <div className="text-sm font-semibold text-slate-100">
                                      {index + 1}. {step.title}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-300">
                                      {step.focus}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    <p className="mt-3 text-xs text-slate-400">
                      {t("advice.imageDisclaimer")}
                    </p>
                  </div>

                  {(m.visual?.imageDataUrl || m.visual?.status === "error") && (
                    <button
                      type="button"
                      onClick={() =>
                        void generateAdviceIllustration(
                          m.id,
                          m.context,
                          m.content,
                          (m.visual?.variant ?? 0) + 1,
                        )
                      }
                      disabled={m.visual?.status === "loading"}
                      className="inline-flex items-center justify-center rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-60 px-3 py-2 text-sm font-medium transition"
                    >
                      {m.visual?.status === "loading"
                        ? t("advice.regeneratingImage")
                        : t("advice.regenerateImage")}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
