import { motion } from "framer-motion";
import AscensionEmblem from "@/assets/Ascension-Emblem.png";

interface LogoLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

export function LogoLoader({ size = "md", className = "" }: LogoLoaderProps) {
  const dimension = sizeMap[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.7, 1, 0.7],
          filter: [
            "drop-shadow(0 0 0px hsl(var(--primary) / 0.3))",
            "drop-shadow(0 0 12px hsl(var(--primary) / 0.5))",
            "drop-shadow(0 0 0px hsl(var(--primary) / 0.3))",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img
          src={AscensionEmblem}
          alt="Loading"
          width={dimension}
          height={dimension}
          className="object-contain"
        />
      </motion.div>
    </div>
  );
}
