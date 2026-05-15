import Link from "next/link";

const benefits = [
  {
    title: "Digital menu in minutes",
    description:
      "Add your dishes, drinks, and categories from one simple dashboard. No design skills required.",
  },
  {
    title: "QR code for every table",
    description:
      "Print a poster or table card. Guests scan once and browse your full menu on their phone.",
  },
  {
    title: "No app needed",
    description:
      "Customers open your menu in the browser. Nothing to download, nothing to install.",
  },
  {
    title: "Easy to update anytime",
    description:
      "Change prices, photos, or daily specials instantly. Your menu stays current.",
  },
];

const steps = [
  {
    step: "1",
    title: "Set up your restaurant",
    description:
      "Add your logo, colors, and contact details. Make the menu feel like your brand.",
  },
  {
    step: "2",
    title: "Build your menu",
    description:
      "Organize items by category, add photos and prices, and highlight chef specials.",
  },
  {
    step: "3",
    title: "Share your QR code",
    description:
      "Print your poster, place it on tables or at the counter, and let guests scan to view.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
            MenuQR
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/auth/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Manage Your Menu
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
              Built for restaurants &amp; cafes
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
              Your digital menu, ready in minutes
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">
              Replace paper menus with a beautiful QR menu guests can open on
              their phone. Update dishes and prices anytime from your dashboard.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/login"
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-8 text-base font-semibold text-white shadow-sm hover:bg-slate-800 sm:w-auto"
              >
                Start Your QR Menu
              </Link>
              <Link
                href="#how-it-works"
                className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-8 text-base font-semibold text-slate-800 hover:bg-slate-50 sm:w-auto"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Why restaurants choose a QR menu
          </h2>
          <p className="mt-3 text-slate-600">
            Simple for you to manage. Simple for your guests to use.
          </p>
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
        className="border-y border-slate-200 bg-white scroll-mt-20"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-slate-600">
              Go live with a professional digital menu in three steps.
            </p>
          </div>

          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <li key={item.step} className="text-center md:text-left">
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
            Ready to modernize your menu?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Create your digital menu, download your QR code, and print a poster
            for your tables. Your guests will thank you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-slate-900 hover:bg-slate-100 sm:w-auto"
            >
              Create Your Digital Menu
            </Link>
            <Link
              href="/auth/login"
              className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-600 px-8 text-base font-semibold text-white hover:bg-slate-800 sm:w-auto"
            >
              Log in to your account
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p>Digital menu platform for restaurants and cafes.</p>
          <div className="flex gap-4">
            <Link href="/auth/login" className="hover:text-slate-800">
              Log in
            </Link>
            <Link href="/auth/login" className="hover:text-slate-800">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
