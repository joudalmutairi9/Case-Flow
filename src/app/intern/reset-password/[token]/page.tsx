import { PortalResetPasswordPage } from "@/components/auth/PortalAuthPages";

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PortalResetPasswordPage portal="intern" token={token} />;
}
