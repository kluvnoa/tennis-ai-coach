// app/[locale]/page.tsx
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("home");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative">
      <div className="absolute top-4 right-4">
        <LocaleSwitcher />
      </div>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t("title")}</h1>
        <p className="text-slate-300 text-sm">{t("description")}</p>
        <Link
          href="/advice"
          className="inline-flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-sm font-medium transition"
        >
          {t("goToAdvice")}
        </Link>
      </div>
    </main>
  );
}
