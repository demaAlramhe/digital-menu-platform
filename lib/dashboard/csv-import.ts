export type CSVRow = {
  category: string;
  name: string;
  description: string;
  price: number;
  is_featured: boolean;
};

export type CSVParseResult = {
  valid: CSVRow[];
  errors: { row: number; reason: string }[];
};

function parseCSVRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") {
        i++;
      }
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim().length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

function isHeaderRow(cells: string[]): boolean {
  const first = cells[0]?.trim().toLowerCase();
  return first === "category" || first === "קטגוריה" || first === "الفئة";
}

function parseFeatured(value: string): boolean | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;
  if (["true", "1", "yes"].includes(trimmed)) return true;
  if (["false", "0", "no"].includes(trimmed)) return false;
  return null;
}

export function parseMenuCSV(text: string): CSVParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { valid: [], errors: [{ row: 1, reason: "emptyFile" }] };
  }

  const parsed = parseCSVRows(trimmed);
  if (parsed.length === 0) {
    return { valid: [], errors: [{ row: 1, reason: "emptyFile" }] };
  }

  const dataRows = isHeaderRow(parsed[0]) ? parsed.slice(1) : parsed;
  const valid: CSVRow[] = [];
  const errors: { row: number; reason: string }[] = [];

  dataRows.forEach((cells, index) => {
    const rowNumber = isHeaderRow(parsed[0]) ? index + 2 : index + 1;

    if (cells.length < 4) {
      errors.push({ row: rowNumber, reason: "invalidRow" });
      return;
    }

    const category = cells[0]?.trim() ?? "";
    const name = cells[1]?.trim() ?? "";
    const description = cells[2]?.trim() ?? "";
    const priceRaw = cells[3]?.trim() ?? "";
    const featuredRaw = cells[4]?.trim() ?? "";

    if (!name) {
      errors.push({ row: rowNumber, reason: "missingName" });
      return;
    }

    if (!priceRaw) {
      errors.push({ row: rowNumber, reason: "invalidPrice" });
      return;
    }

    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price <= 0) {
      errors.push({ row: rowNumber, reason: "invalidPrice" });
      return;
    }

    const featured = parseFeatured(featuredRaw);
    if (featured === null) {
      errors.push({ row: rowNumber, reason: "invalidFeatured" });
      return;
    }

    valid.push({
      category,
      name,
      description,
      price,
      is_featured: featured,
    });
  });

  return { valid, errors };
}

export function generateCSVTemplate(): string {
  return [
    "category,name,description,price,is_featured",
    '"مشويات","شيش طاووق","مع صوص ثوم",45,false',
    '"مشويات","كباب","لحم مشوي",40,true',
    '"مشروبات","عصير برتقال","طازج",20,false',
  ].join("\n");
}
