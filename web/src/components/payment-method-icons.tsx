import { Banknote, CreditCard, SmartphoneNfc, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentMethodIconsProps = {
  className?: string;
  iconClassName?: string;
};

export function PaymentMethodIcons({
  className,
  iconClassName,
}: PaymentMethodIconsProps) {
  const iconCls = cn(
    "shrink-0 text-muted-foreground opacity-60",
    iconClassName ?? "h-6 w-6",
  );

  return (
    <div
      className={cn("flex items-center gap-4", className)}
      aria-label="Accepted payment methods: Visa, Mastercard, American Express, Apple Pay"
    >
      <CreditCard className={iconCls} aria-hidden />
      <WalletCards className={iconCls} aria-hidden />
      <Banknote className={iconCls} aria-hidden />
      <SmartphoneNfc className={iconCls} aria-hidden />
    </div>
  );
}
