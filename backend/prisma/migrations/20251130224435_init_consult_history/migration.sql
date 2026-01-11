-- CreateTable
CREATE TABLE "ConsultHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userMessage" TEXT NOT NULL,
    "aiMessage" TEXT NOT NULL,
    "topic" TEXT,
    "userId" TEXT,

    CONSTRAINT "ConsultHistory_pkey" PRIMARY KEY ("id")
);
