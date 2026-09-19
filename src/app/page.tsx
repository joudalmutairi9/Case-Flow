import Link from "next/link";
import { PORTALS, type PortalKey } from "@/lib/portals";

const ORDER: PortalKey[] = ["student", "intern", "supervisor", "records", "admin"];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
            CF
          </div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">
            منصة تدريب طب الأسنان
          </h1>
          <p className="mt-2 text-muted">
            المستشفى الجامعي لطب الأسنان — الفرز السريري وبنك الحالات
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORDER.map((key) => (
            <Link
              key={key}
              href={`/${key}/login`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-lg font-bold text-card-foreground">
                {PORTALS[key].nameAr}
              </span>
              <span className="mt-1 text-sm text-muted">
                تسجيل الدخول باسم المستخدم وكلمة المرور
              </span>
              <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                الدخول ←
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
