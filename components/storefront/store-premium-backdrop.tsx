type StorePremiumBackdropProps = {
  imageUrl?: string | null;
};

/** Full-screen restaurant photo + dark overlays (welcome & menu). */
export function StorePremiumBackdrop({ imageUrl }: StorePremiumBackdropProps) {
  return (
    <>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="pointer-events-none fixed inset-0 h-full w-full object-cover"
          aria-hidden
        />
      ) : (
        <div
          className="pointer-events-none fixed inset-0 bg-gradient-to-br from-[#1a1510] via-[#0c0b0a] to-[#1f1812]"
          aria-hidden
        />
      )}
      <div className="pointer-events-none fixed inset-0 bg-black/55" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/65"
        aria-hidden
      />
    </>
  );
}
