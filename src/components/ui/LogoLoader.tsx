import { motion } from "framer-motion";
import AscensionEmblem from "@/assets/Ascension-Emblem.png";

interface LogoLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "spin" | "pulse-spin" | "orbit" | "corners" | "glow-spin";
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

// Orbit dot size relative to logo size
const orbitDotSizeMap = {
  sm: 4,
  md: 6,
  lg: 8,
};

// Corner dot size relative to logo size
const cornerDotSizeMap = {
  sm: 3,
  md: 4,
  lg: 6,
};

export function LogoLoader({ size = "md", variant = "default", className = "" }: LogoLoaderProps) {
  const dimension = sizeMap[size];
  const orbitDotSize = orbitDotSizeMap[size];
  const cornerDotSize = cornerDotSizeMap[size];
  const orbitRadius = dimension * 0.8;

  // Triangle vertices for orbit path (pointing up)
  const trianglePoints = [
    { x: 0, y: -orbitRadius }, // Top
    { x: orbitRadius * 0.866, y: orbitRadius * 0.5 }, // Bottom right
    { x: -orbitRadius * 0.866, y: orbitRadius * 0.5 }, // Bottom left
  ];

  // Corner positions for corners variant (slightly outside the logo)
  const cornerOffset = dimension * 0.55;
  const cornerPositions = [
    { x: 0, y: -cornerOffset }, // Top
    { x: cornerOffset * 0.866, y: cornerOffset * 0.5 }, // Bottom right
    { x: -cornerOffset * 0.866, y: cornerOffset * 0.5 }, // Bottom left
  ];

  const renderLogo = (animationProps: object) => (
    <motion.div {...animationProps}>
      <img
        src={AscensionEmblem}
        alt="Loading"
        width={dimension}
        height={dimension}
        className="object-contain"
      />
    </motion.div>
  );

  // Default: pulse/breathe/glow animation
  if (variant === "default") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {renderLogo({
          animate: {
            scale: [1, 1.08, 1],
            opacity: [0.7, 1, 0.7],
            filter: [
              "drop-shadow(0 0 0px hsl(var(--primary) / 0.3))",
              "drop-shadow(0 0 12px hsl(var(--primary) / 0.5))",
              "drop-shadow(0 0 0px hsl(var(--primary) / 0.3))",
            ],
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

  // Spin: slow elegant rotation
  if (variant === "spin") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {renderLogo({
          animate: {
            rotate: [0, 360],
          },
          transition: {
            duration: 3.5,
            repeat: Infinity,
            ease: "linear",
          },
        })}
      </div>
    );
  }

  // Pulse-spin: combination of pulse/breathe with slow spin
  if (variant === "pulse-spin") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {renderLogo({
          animate: {
            scale: [1, 1.08, 1],
            opacity: [0.7, 1, 0.7],
            rotate: [0, 360],
            filter: [
              "drop-shadow(0 0 0px hsl(var(--primary) / 0.3))",
              "drop-shadow(0 0 12px hsl(var(--primary) / 0.5))",
              "drop-shadow(0 0 0px hsl(var(--primary) / 0.3))",
            ],
          },
          transition: {
            duration: 3.5,
            repeat: Infinity,
            ease: "linear",
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
            opacity: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
            filter: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
        })}
      </div>
    );
  }

  // Orbit: three dots orbiting in triangular path
  if (variant === "orbit") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative">
          {renderLogo({
            animate: {
              opacity: [0.8, 1, 0.8],
            },
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          })}
          
          {/* Orbiting dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary"
              style={{
                width: orbitDotSize,
                height: orbitDotSize,
                left: "50%",
                top: "50%",
                marginLeft: -orbitDotSize / 2,
                marginTop: -orbitDotSize / 2,
              }}
              animate={{
                x: [
                  trianglePoints[0].x,
                  trianglePoints[1].x,
                  trianglePoints[2].x,
                  trianglePoints[0].x,
                ],
                y: [
                  trianglePoints[0].y,
                  trianglePoints[1].y,
                  trianglePoints[2].y,
                  trianglePoints[0].y,
                ],
                opacity: [0.6, 1, 0.6, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.833, // Stagger by 1/3 of duration
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Corners: three dots pulsing at triangle vertices
  if (variant === "corners") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative">
          {renderLogo({
            animate: {
              opacity: [0.8, 1, 0.8],
            },
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          })}
          
          {/* Corner dots */}
          {cornerPositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary"
              style={{
                width: cornerDotSize,
                height: cornerDotSize,
                left: "50%",
                top: "50%",
                marginLeft: -cornerDotSize / 2,
                marginTop: -cornerDotSize / 2,
                x: pos.x,
                y: pos.y,
              }}
              animate={{
                scale: [0.5, 1.2, 0.5],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5, // Stagger timing
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Glow-spin: enhanced glow with slow rotation
  if (variant === "glow-spin") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {renderLogo({
          animate: {
            rotate: [0, 360],
            filter: [
              "drop-shadow(0 0 4px hsl(var(--primary) / 0.4)) drop-shadow(0 0 8px hsl(var(--primary) / 0.2))",
              "drop-shadow(0 0 16px hsl(var(--primary) / 0.6)) drop-shadow(0 0 24px hsl(var(--primary) / 0.3))",
              "drop-shadow(0 0 4px hsl(var(--primary) / 0.4)) drop-shadow(0 0 8px hsl(var(--primary) / 0.2))",
            ],
          },
          transition: {
            rotate: {
              duration: 3.5,
              repeat: Infinity,
              ease: "linear",
            },
            filter: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
        })}
      </div>
    );
  }

  // Fallback to default
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderLogo({
        animate: {
          scale: [1, 1.08, 1],
          opacity: [0.7, 1, 0.7],
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
