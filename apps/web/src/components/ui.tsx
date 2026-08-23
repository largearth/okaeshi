import { HugeiconsIcon } from "@hugeicons/react";
import ArrowLeft01Icon from "@hugeicons/core-free-icons/ArrowLeft01Icon";
import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";
import Calendar01Icon from "@hugeicons/core-free-icons/Calendar01Icon";
import Home01Icon from "@hugeicons/core-free-icons/Home01Icon";
import Invoice01Icon from "@hugeicons/core-free-icons/Invoice01Icon";
import Notification01Icon from "@hugeicons/core-free-icons/Notification01Icon";
import PlusSignIcon from "@hugeicons/core-free-icons/PlusSignIcon";
import Tick01Icon from "@hugeicons/core-free-icons/Tick01Icon";
import UserGroupIcon from "@hugeicons/core-free-icons/UserGroupIcon";
import UserIcon from "@hugeicons/core-free-icons/UserIcon";
import Wallet01Icon from "@hugeicons/core-free-icons/Wallet01Icon";
import type { ReactNode } from "react";

export type IconName =
  | "home"
  | "wallet"
  | "plus"
  | "receipt"
  | "user"
  | "bell"
  | "chevron"
  | "back"
  | "calendar"
  | "check"
  | "group";
const icons = {
  home: Home01Icon,
  wallet: Wallet01Icon,
  plus: PlusSignIcon,
  receipt: Invoice01Icon,
  user: UserIcon,
  bell: Notification01Icon,
  chevron: ArrowRight01Icon,
  back: ArrowLeft01Icon,
  calendar: Calendar01Icon,
  check: Tick01Icon,
  group: UserGroupIcon,
};
export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <HugeiconsIcon
      icon={icons[name]}
      size={size}
      color="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );
}
export function Avatar({ name = "大地" }: { name?: string }) {
  return (
    <div
      className="grid size-10 shrink-0 place-items-center rounded-full border border-black bg-white text-black"
      aria-label={name}
    >
      <Icon name="user" size={21} />
    </div>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden border border-black bg-white ${className}`}
    >
      {children}
    </div>
  );
}
export function Badge({
  children,
}: {
  children: ReactNode;
  tone?: "neutral" | "yellow" | "green";
}) {
  return (
    <span className="inline-flex items-center justify-center rounded-full border border-black bg-white px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-black">
      {children}
    </span>
  );
}
