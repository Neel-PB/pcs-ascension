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
  sm: 6,
  md: 8,
  lg: 10,
};

// Corner dot size relative to logo size
const cornerDotSizeMap = {
  sm: 5,
  md: 7,
  lg: 9,
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
  const cornerOffset = dimension * 0.6;
  const cornerPositions = [
    { x: 0, y: -cornerOffset }, // Top
    { x: cornerOffset * 0.866, y: cornerOffset * 0.5 }, // Bottom right
    { x: -cornerOffset * 0.866, y: cornerOffset * 0.5 }, // Bottom left
  ];

  // Ripple rings component for visibility on both themes
  const RippleRings = () => (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-primary"
          style={{
            width: dimension,
            height: dimension,
            left: "50%",
            top: "50%",
            marginLeft: -dimension / 2,
            marginTop: -dimension / 2,
          }}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{
            scale: [0.8, 2, 2.5],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 2.4,
            delay: i * 0.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );

  // Backdrop pulse for contrast on light backgrounds
  const BackdropPulse = () => (
    <motion.div
      className="absolute rounded-full bg-primary/15 dark:bg-primary/25"
      style={{
        width: dimension * 1.6,
        height: dimension * 1.6,
        left: "50%",
        top: "50%",
        marginLeft: -(dimension * 1.6) / 2,
        marginTop: -(dimension * 1.6) / 2,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.4, 0.2, 0.4],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );

  const renderLogo = (animationProps: object) => (
    <motion.div className="relative z-10" {...animationProps}>
      <img
        src={AscensionEmblem}
        alt="Loading"
        width={dimension}
        height={dimension}
        className="object-contain"
      />
    </motion.div>
  );

  // Default: pulse/breathe/glow animation with ripples
  if (variant === "default") {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: dimension * 2.5, height: dimension * 2.5 }}
      >
        <BackdropPulse />
        <RippleRings />
        {renderLogo({
          animate: {
            scale: [1, 1.08, 1],
            opacity: [0.85, 1, 0.85],
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

  // Spin: slow elegant rotation with backdrop
  if (variant === "spin") {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: dimension * 2.5, height: dimension * 2.5 }}
      >
        <BackdropPulse />
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

  // Pulse-spin: combination of pulse/breathe with slow spin and ripples
  if (variant === "pulse-spin") {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: dimension * 2.5, height: dimension * 2.5 }}
      >
        <BackdropPulse />
        <RippleRings />
        {renderLogo({
          animate: {
            scale: [1, 1.08, 1],
            opacity: [0.85, 1, 0.85],
            rotate: [0, 360],
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
          },
        })}
      </div>
    );
  }

  // Orbit: three dots orbiting in triangular path with backdrop
  if (variant === "orbit") {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: dimension * 2.5, height: dimension * 2.5 }}
      >
        <BackdropPulse />

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary shadow-lg"
            style={{
              width: orbitDotSize,
              height: orbitDotSize,
              left: "50%",
              top: "50%",
              marginLeft: -orbitDotSize / 2,
              marginTop: -orbitDotSize / 2,
              boxShadow: "0 0 8px hsl(var(--primary) / 0.6)",
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
              opacity: [0.7, 1, 0.7, 0.7],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.833,
            }}
          />
        ))}

        {renderLogo({
          animate: {
            scale: [1, 1.03, 1],
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

  // Corners: three dots pulsing at triangle vertices with backdrop
  if (variant === "corners") {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: dimension * 2.5, height: dimension * 2.5 }}
      >
        <BackdropPulse />

        {/* Corner dots */}
        {cornerPositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary shadow-lg"
            style={{
              width: cornerDotSize,
              height: cornerDotSize,
              left: "50%",
              top: "50%",
              marginLeft: -cornerDotSize / 2,
              marginTop: -cornerDotSize / 2,
              x: pos.x,
              y: pos.y,
              boxShadow: "0 0 10px hsl(var(--primary) / 0.5)",
            }}
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}

        {renderLogo({
          animate: {
            scale: [1, 1.02, 1],
            opacity: [0.9, 1, 0.9],
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

  // Glow-spin: enhanced glow with slow rotation and ripples
  if (variant === "glow-spin") {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: dimension * 2.5, height: dimension * 2.5 }}
      >
        <BackdropPulse />
        <RippleRings />

        <motion.div
          className="relative z-10"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              width: dimension,
              height: dimension,
              background: "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <img
            src={AscensionEmblem}
            alt="Loading"
            width={dimension}
            height={dimension}
            className="object-contain"
            style={{
              filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.6))",
            }}
          />
        </motion.div>
      </div>
    );
  }

  // Fallback to default
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: dimension * 2.5, height: dimension * 2.5 }}
    >
      <BackdropPulse />
      <RippleRings />
      {renderLogo({
        animate: {
          scale: [1, 1.08, 1],
          opacity: [0.85, 1, 0.85],
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
