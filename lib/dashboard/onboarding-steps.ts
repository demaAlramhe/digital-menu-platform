export type OnboardingStep = {
  id: string;
  complete: boolean;
  href: string;
};

export type OnboardingProgress = {
  steps: OnboardingStep[];
  completedCount: number;
  totalCount: number;
  allComplete: boolean;
};

export function getOnboardingProgress(
  store: {
    logo_url?: string | null;
    name?: string | null;
    phone?: string | null;
    primary_color?: string | null;
    whatsapp_number?: string | null;
  },
  counts: {
    categoryCount: number;
    itemWithImageCount: number;
  }
): OnboardingProgress {
  const steps: OnboardingStep[] = [
    {
      id: "logo",
      complete: !!store.logo_url?.trim(),
      href: "/dashboard/settings",
    },
    {
      id: "contact",
      complete: !!(store.name?.trim() && store.phone?.trim()),
      href: "/dashboard/settings",
    },
    {
      id: "colors",
      complete: !!store.primary_color?.trim(),
      href: "/dashboard/settings",
    },
    {
      id: "category",
      complete: counts.categoryCount > 0,
      href: "/dashboard/categories/new",
    },
    {
      id: "item",
      complete: counts.itemWithImageCount > 0,
      href: "/dashboard/menu-items/new",
    },
    {
      id: "whatsapp",
      complete: !!store.whatsapp_number?.trim(),
      href: "/dashboard/settings",
    },
    {
      id: "preview",
      complete: false,
      href: "/dashboard/qr",
    },
    {
      id: "qr",
      complete: false,
      href: "/dashboard/qr/poster",
    },
  ];

  const autoSteps = steps.filter(
    (s) => !["preview", "qr"].includes(s.id)
  );
  const completedCount = steps.filter((s) => s.complete).length;
  return {
    steps,
    completedCount,
    totalCount: steps.length,
    allComplete: autoSteps.every((s) => s.complete),
  };
}
