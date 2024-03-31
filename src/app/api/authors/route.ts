import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/utilities/database";
import { ensureNumber } from "@/utilities/ensure-number";

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const parsed_offset = parseInt(
    searchParams.get("offset") ?? `${DEFAULT_OFFSET}`,
    10
  );
  let parsed_limit = parseInt(
    searchParams.get("limit") ?? `${DEFAULT_LIMIT}`,
    10
  );

  let errors = [];
  if (isNaN(parsed_offset)) {
    errors.push("offset must be a number");
  }
  if (isNaN(parsed_limit)) {
    errors.push("limit must be a number");
  }

  if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 });

  if (parsed_limit > MAX_LIMIT) {
    parsed_limit = MAX_LIMIT;
  }

  const db = new Database();
  const [quotes, count] = await Promise.all([
    db.findAuthors({
      offset: isNaN(parsed_offset) ? undefined : parsed_offset,
      limit: isNaN(parsed_limit) ? undefined : parsed_limit,
    }),
    db.countAuthors(),
  ]);

  return NextResponse.json({
    offset: parsed_offset,
    limit: parsed_limit,
    results: quotes,
    total: count,
  });
}
