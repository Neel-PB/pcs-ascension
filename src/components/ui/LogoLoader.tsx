import { motion } from "framer-motion";
import AscensionEmblem from "@/assets/Ascension-Emblem.svg";

interface LogoLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "scan" | "glow" | "pulse" | "dots";
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

export function LogoLoader({ size = "md", variant = "default", className = "" }: LogoLoaderProps) {
  const dimension = sizeMap[size];

  // Scan line that moves up and down across the logo
  const ScanLine = () => (
    <motion.div
      className="absolute rounded-full bg-primary/60 dark:bg-primary/80"
      style={{
        width: dimension * 1.2,
        height: 2,
        left: "50%",
        marginLeft: -(dimension * 1.2) / 2,
      }}
      animate={{
        y: [-dimension * 0.4, dimension * 0.4],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />
  );


  // Three pulsing dots below the logo
  const LoadingDots = () => (
    <div className="flex gap-1.5 mt-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full bg-primary"
          style={{
            width: dimension * 0.1,
            height: dimension * 0.1,
            minWidth: 4,
            minHeight: 4,
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1,
            delay: i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const renderLogo = (animationProps: object = {}) => (
    <motion.div 
      className="relative z-10 flex items-center justify-center rounded-full"
      style={{ 
        width: dimension, 
        height: dimension,
        backgroundColor: 'hsl(var(--primary) / 0.08)',
      }}
      {...animationProps}
    >
      <img
        src={AscensionEmblem}
        alt="Loading"
        width={dimension}
        height={dimension}
        loading="eager"
        decoding="sync"
        // @ts-expect-error - fetchpriority is valid HTML but not in React types yet
        fetchpriority="high"
        className="object-contain"
        style={{ 
          minWidth: dimension, 
          minHeight: dimension 
        }}
      />
    </motion.div>
  );

  // Default: breathe + loading dots (professional, modern)
  if (variant === "default") {
    return (
      <div
        className={`relative flex flex-col items-center justify-center ${className}`}
        style={{ width: dimension * 2, height: dimension * 2.5 }}
      >
        {renderLogo({
          animate: {
            scale: [1, 1.03, 1],
          },
          transition: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        })}
        <LoadingDots />
      </div>
    );
  }

  // Scan: Just the scanning line
  if (variant === "scan") {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: dimension * 2, height: dimension * 2 }}
      >
        <ScanLine />
        {renderLogo()}
      </div>
    );
  }

  // Glow: Soft rotating glow
  if (variant === "glow") {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: dimension * 2, height: dimension * 2 }}
      >
        {renderLogo({
          animate: {
            scale: [1, 1.05, 1],
          },
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        })}
      </div>
    );
  }

  // Pulse: Simple breathe only (minimalist)
  if (variant === "pulse") {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: dimension * 2, height: dimension * 2 }}
      >
        {renderLogo({
          animate: {
            scale: [1, 1.08, 1],
            opacity: [0.8, 1, 0.8],
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        })}
      </div>
    );
  }

  // Dots: Logo + loading dots below
  if (variant === "dots") {
    return (
      <div
        className={`relative flex flex-col items-center justify-center ${className}`}
        style={{ width: dimension * 2, height: dimension * 2.5 }}
      >
        {renderLogo({
          animate: {
            scale: [1, 1.02, 1],
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        })}
        <LoadingDots />
      </div>
    );
  }

  // Fallback to default
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: dimension * 2, height: dimension * 2 }}
      >
        <ScanLine />
        {renderLogo({
        animate: {
          scale: [1, 1.03, 1],
        },
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      })}
    </div>
  );
}
