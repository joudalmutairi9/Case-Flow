import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-data";

function tokenMatches(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// One-time (idempotent) production bootstrap: creates the demo accounts and
// reference data from the BRD. Protected by SEED_TOKEN since it is reachable
// over the internet like any other route. Visit
// /api/admin/seed?token=<SEED_TOKEN> once after the first deploy.
export async function GET(request: NextRequest) {
  const expected = process.env.SEED_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "SEED_TOKEN غير معرّف في متغيرات البيئة." },
      { status: 500 }
    );
  }

  const provided = request.nextUrl.searchParams.get("token") ?? "";
  if (!tokenMatches(provided, expected)) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }

  const credentials = await seedDatabase(prisma);

  return NextResponse.json({
    message: "تمت التهيئة بنجاح. غيّر كلمة المرور عند أول دخول لكل حساب.",
    accounts: credentials,
  });
}
