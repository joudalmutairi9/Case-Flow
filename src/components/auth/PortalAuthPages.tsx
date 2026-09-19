import { AuthShell } from "./AuthShell";
import { LoginForm } from "./LoginForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { PORTALS, type PortalKey } from "@/lib/portals";
import { getSession } from "@/lib/session";

export function PortalLoginPage({ portal }: { portal: PortalKey }) {
  const config = PORTALS[portal];
  return (
    <AuthShell portalName={config.nameAr}>
      <LoginForm portal={portal} usernameHint={config.usernameHintAr} />
    </AuthShell>
  );
}

export function PortalForgotPasswordPage({ portal }: { portal: PortalKey }) {
  const config = PORTALS[portal];
  return (
    <AuthShell portalName={config.nameAr} title="استعادة كلمة المرور">
      <ForgotPasswordForm portal={portal} />
    </AuthShell>
  );
}

export function PortalResetPasswordPage({
  portal,
  token,
}: {
  portal: PortalKey;
  token: string;
}) {
  const config = PORTALS[portal];
  return (
    <AuthShell portalName={config.nameAr} title="تعيين كلمة مرور جديدة">
      <ResetPasswordForm portal={portal} token={token} />
    </AuthShell>
  );
}

export async function PortalChangePasswordPage({ portal }: { portal: PortalKey }) {
  const config = PORTALS[portal];
  const session = await getSession();
  return (
    <AuthShell portalName={config.nameAr} title="تغيير كلمة المرور">
      <ChangePasswordForm portal={portal} forced={session?.mustChangePassword} />
    </AuthShell>
  );
}
