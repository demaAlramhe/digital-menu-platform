import Link from "next/link";
import { SiteHeader } from "@/components/i18n/site-header";
import { getTranslations } from "@/lib/i18n/server";

export default async function HomePage() {
  const { dict } = await getTranslations();

  const benefits = [
    {
      title: dict.home.benefit1Title,
      description: dict.home.benefit1Desc,
    },
    {
      title: dict.home.benefit2Title,
      description: dict.home.benefit2Desc,
    },
    {
      title: dict.home.benefit3Title,
      description: dict.home.benefit3Desc,
    },
    {
      title: dict.home.benefit4Title,
      description: dict.home.benefit4Desc,
    },
  ];

  const steps = [
    { step: "1", title: dict.home.step1Title, description: dict.home.step1Desc },
    { step: "2", title: dict.home.step2Title, description: dict.home.step2Desc },
    { step: "3", title: dict.home.step3Title, description: dict.home.step3Desc },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
              {dict.home.badge}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
              {dict.home.headline}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">
              {dict.home.subheadline}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/login"
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-8 text-base font-semibold text-white shadow-sm hover:bg-slate-800 sm:w-auto"
              >
                {dict.home.ctaStart}
              </Link>
              <Link
                href="#how-it-works"
                className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-8 text-base font-semibold text-slate-800 hover:bg-slate-50 sm:w-auto"
              >
                {dict.home.ctaHow}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {dict.home.benefitsTitle}
          </h2>
          <p className="mt-3 text-slate-600">{dict.home.benefitsSubtitle}</p>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {benefit.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                {benefit.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {dict.home.howTitle}
            </h2>
            <p className="mt-3 text-slate-600">{dict.home.howSubtitle}</p>
          </div>

          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <li key={item.step} className="text-center md:text-start">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white"
                  aria-hidden
                >
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="rounded-2xl bg-slate-900 px-6 py-10 text-center sm:px-10 sm:py-14">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {dict.home.ctaFinalTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            {dict.home.ctaFinalDesc}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-slate-900 hover:bg-slate-100 sm:w-auto"
            >
              {dict.home.ctaCreate}
            </Link>
            <Link
              href="/auth/login"
              className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-600 px-8 text-base font-semibold text-white hover:bg-slate-800 sm:w-auto"
            >
              {dict.home.ctaLogin}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p>{dict.home.footer}</p>
          <div className="flex gap-4">
            <Link href="/auth/login" className="hover:text-slate-800">
              {dict.common.login}
            </Link>
            <Link href="/auth/login" className="hover:text-slate-800">
              {dict.home.footerDashboard}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
