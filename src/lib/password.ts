import bcrypt from "bcryptjs";

const MIN_LENGTH = 8;
const PASSWORD_HISTORY_LIMIT = 3;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Business rule AUTH-02: length + character classes + must not equal username. */
export function validatePasswordPolicy(
  password: string,
  username: string
): string | null {
  if (password.length < MIN_LENGTH) {
    return "كلمة المرور يجب ألا تقل عن 8 أحرف.";
  }
  if (!/[A-Z]/.test(password)) {
    return "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل.";
  }
  if (!/[a-z]/.test(password)) {
    return "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل.";
  }
  if (!/[0-9]/.test(password)) {
    return "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "يجب أن تحتوي كلمة المرور على رمز واحد على الأقل.";
  }
  if (password.toLowerCase() === username.toLowerCase()) {
    return "لا يمكن أن تساوي كلمة المرور اسم المستخدم.";
  }
  return null;
}

export async function isPasswordReused(
  password: string,
  previousHashes: string[]
) {
  for (const hash of previousHashes.slice(0, PASSWORD_HISTORY_LIMIT)) {
    if (await bcrypt.compare(password, hash)) {
      return true;
    }
  }
  return false;
}

export function generateTemporaryPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%*?";
  const all = upper + lower + digits + symbols;

  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];

  let pwd = pick(upper) + pick(lower) + pick(digits) + pick(symbols);
  for (let i = 0; i < 6; i++) pwd += pick(all);

  return pwd
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export { PASSWORD_HISTORY_LIMIT };
