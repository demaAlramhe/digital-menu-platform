import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export function validationErrorResponse(error: ZodError) {
  const first = error.issues[0];
  const message = first
    ? first.path.length > 0
      ? `${first.path.join(".")}: ${first.message}`
      : first.message
    : "Invalid request body.";

  return NextResponse.json(
    {
      error: message,
      issues: error.flatten().fieldErrors,
    },
    { status: 400 }
  );
}

export async function parseJsonBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const json: unknown = await req.json();
    const data = schema.parse(json);
    return { data, error: null };
  } catch (e) {
    if (e instanceof ZodError) {
      return { data: null, error: validationErrorResponse(e) };
    }
    return {
      data: null,
      error: NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }),
    };
  }
}
