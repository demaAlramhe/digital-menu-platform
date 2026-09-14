import fs from "node:fs";

const file = process.argv[2];
const projectId = process.argv[3] || "rfugdsubimdlakmvqyjm";
const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();

if (!file) {
  console.error("Usage: node scripts/apply-sql-file.mjs <sql-file> [project-id]");
  process.exit(1);
}

if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN is required.");
  process.exit(1);
}

function splitSqlStatements(sql) {
  return sql
    .split(";")
    .map((part) => part.trim())
    .filter((part) => {
      const withoutComments = part
        .replace(/--[^\n]*/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .trim();
      return withoutComments.length > 0;
    });
}

const sql = fs.readFileSync(file, "utf8");
const statements = splitSqlStatements(sql);

for (const [index, statement] of statements.entries()) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectId}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: `${statement};` }),
    }
  );

  const body = await response.text();
  if (!response.ok) {
    console.error(
      `Failed to apply ${file} statement ${index + 1}/${statements.length} (${response.status})`
    );
    console.error(body.slice(0, 1500));
    process.exit(1);
  }
}

console.log(`Applied ${file} (${statements.length} statements)`);
