import { IconActionButton } from "@/components/ui/IconActionButton";
import { PowerIcon, UnlockIcon } from "@/components/ui/Icons";

export function ToggleStatusButton({
  action,
  active,
  activeLabel = "تعطيل",
  inactiveLabel = "تفعيل",
}: {
  action: () => Promise<void> | void;
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <form action={action}>
      <IconActionButton
        tone={active ? "accent" : "primary"}
        label={active ? activeLabel : inactiveLabel}
        icon={<PowerIcon size={16} />}
      />
    </form>
  );
}

export function UnlockButton({ action, label = "فتح القفل" }: { action: () => Promise<void> | void; label?: string }) {
  return (
    <form action={action}>
      <IconActionButton tone="tertiary" label={label} icon={<UnlockIcon size={16} />} />
    </form>
  );
}
