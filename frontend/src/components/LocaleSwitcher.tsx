"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value as "en" | "ja";
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc === "en" ? "English" : "Japanese"}
        </option>
      ))}
    </select>
  );
}
