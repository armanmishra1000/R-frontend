import { cn } from "@/lib/utils";

interface PresenceBadgeProps {
  presence: 'online' | 'offline' | 'idle';
  className?: string;
}

export function PresenceBadge({ presence, className }: PresenceBadgeProps) {
  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
        presence === 'online' ? 'bg-green-500' : 'bg-gray-400',
        className
      )}
    />
  );
}