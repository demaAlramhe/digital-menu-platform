"use client";

type CategoryNavItem = {
  id: string;
  name: string;
};

type MenuCategoryNavProps = {
  categories: CategoryNavItem[];
  primaryColor: string;
  showFeatured?: boolean;
};

export function MenuCategoryNav({
  categories,
  primaryColor,
  showFeatured = false,
}: MenuCategoryNavProps) {
  if (categories.length === 0 && !showFeatured) {
    return null;
  }

  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md"
      aria-label="Menu categories"
    >
      <div className="mx-auto max-w-2xl px-4 py-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Jump to
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {showFeatured && (
            <CategoryPill
              label="Featured"
              onClick={() => scrollToSection("menu-featured")}
              primaryColor={primaryColor}
            />
          )}
          {categories.map((category) => (
            <CategoryPill
              key={category.id}
              label={category.name}
              onClick={() => scrollToSection(`category-${category.id}`)}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

function CategoryPill({
  label,
  onClick,
  primaryColor,
}: {
  label: string;
  onClick: () => void;
  primaryColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition active:scale-[0.97]"
      style={{ scrollMarginTop: "5rem" }}
    >
      <span
        className="mr-1.5 inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: primaryColor }}
        aria-hidden
      />
      {label}
    </button>
  );
}
