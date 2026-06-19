import { Suspense } from "react";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { SiteHeader } from "@/components/i18n/site-header";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-bg text-brand-dark">
      <SiteHeader />
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center p-8 text-center text-[#6b7280]">
            ...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
      <MarketingFooter />
    </div>
  );
}
