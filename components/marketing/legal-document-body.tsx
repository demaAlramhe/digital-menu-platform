import type { LegalBlock, LegalDocument } from "@/lib/legal/documents";

type LegalDocumentBodyProps = {
  document: LegalDocument;
  englishNote?: string | null;
};

export function LegalDocumentBody({
  document,
  englishNote,
}: LegalDocumentBodyProps) {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8 border-b border-brand-secondary/40 pb-6 text-center sm:mb-10 sm:pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
          Bel Afia
        </p>
        <h1 className="mt-3 text-3xl font-bold text-brand-dark sm:text-4xl">
          {document.title}
        </h1>
        <p className="mt-3 text-sm text-[#6b7280]">{document.updated}</p>
        {englishNote ? (
          <p
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="note"
          >
            {englishNote}
          </p>
        ) : null}
      </header>

      <div className="space-y-5 text-[15px] leading-relaxed text-[#374151] sm:text-base">
        {document.blocks.map((block, index) => (
          <LegalBlockView key={`${block.type}-${index}`} block={block} />
        ))}
      </div>
    </article>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === "h3") {
    return (
      <h2 className="pt-2 text-lg font-bold text-brand-dark sm:text-xl">
        {block.text}
      </h2>
    );
  }

  if (block.type === "p") {
    return <p>{block.text}</p>;
  }

  return (
    <ul className="list-disc space-y-2 ps-5">
      {block.items.map((item, index) => (
        <li key={index}>
          {item.lead ? (
            <>
              <strong>{item.lead}</strong>
              {" — "}
              {item.text}
            </>
          ) : (
            item.text
          )}
        </li>
      ))}
    </ul>
  );
}
