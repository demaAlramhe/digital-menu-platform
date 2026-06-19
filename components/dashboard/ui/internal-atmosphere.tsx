/** Subtle decorative background for internal app shells. */
export function InternalAtmosphere() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -top-28 start-[8%] h-80 w-80 rounded-full bg-brand-secondary/35 blur-3xl" />
      <div className="absolute top-[22%] end-[-4rem] h-[22rem] w-[22rem] rounded-full bg-stone-200/45 blur-3xl" />
      <div className="absolute bottom-[-6rem] start-[-3rem] h-72 w-72 rounded-full bg-sky-100/30 blur-3xl" />
    </div>
  );
}
