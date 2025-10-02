import { motion } from "framer-motion";

interface TypingIndicatorProps {
  typingUsers: string[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) {
    return null;
  }

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : typingUsers.length === 2
      ? `${typingUsers.join(" and ")} are typing`
      : `${typingUsers.slice(0, 2).join(", ")} and others are typing`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground h-5">
      <span>{text}</span>
      <motion.div
        className="flex gap-0.5"
        transition={{ staggerChildren: 0.2, repeat: Infinity }}
      >
        <motion.div
          className="h-1.5 w-1.5 bg-muted-foreground rounded-full"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <motion.div
          className="h-1.5 w-1.5 bg-muted-foreground rounded-full"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.8, delay: 0.2, repeat: Infinity }}
        />
        <motion.div
          className="h-1.5 w-1.5 bg-muted-foreground rounded-full"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.8, delay: 0.4, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}