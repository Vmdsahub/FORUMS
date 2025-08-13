import { useTheme } from "@/contexts/ThemeContext";

export default function GlassmorphismBackground() {
  const { currentTheme } = useTheme();

  if (currentTheme !== "glassmorphism-liquid") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        style={{
          filter: "blur(1px) saturate(1.2) contrast(1.1)",
        }}
      >
        <source
          src="https://cdn.builder.io/o/assets%2Fc2e2036daac94e30a2750cdc98393ad5%2F36e22a59d6a4488394b7f9a9f9c23fad?alt=media&token=ec792d4a-0248-41bd-afa9-075ffda8a77f&apiKey=c2e2036daac94e30a2750cdc98393ad5"
          type="video/mp4"
        />
      </video>
      
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(0, 212, 255, 0.08) 0%,
            rgba(168, 85, 247, 0.06) 25%,
            rgba(236, 72, 153, 0.04) 50%,
            rgba(16, 185, 129, 0.06) 75%,
            rgba(59, 130, 246, 0.08) 100%
          )`,
          animation: "liquidFlow 20s ease-in-out infinite",
        }}
      />
      
      {/* Additional liquid effects */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(0, 212, 255, 0.3), transparent)",
            top: "10%",
            left: "10%",
            animation: "glassFloat 8s ease-in-out infinite",
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent)",
            top: "60%",
            right: "10%",
            animation: "glassFloat 10s ease-in-out infinite reverse",
          }}
        />
        <div 
          className="absolute w-72 h-72 rounded-full blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.3), transparent)",
            bottom: "10%",
            left: "30%",
            animation: "glassFloat 12s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
