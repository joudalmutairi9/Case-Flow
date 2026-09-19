import { Prisma } from "@prisma/client";

/** True when a delete failed because other rows still reference it (FK restrict). */
export function isForeignKeyError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2003" || error.code === "P2014")
  );
}
