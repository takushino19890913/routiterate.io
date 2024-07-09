import React, { useEffect, useRef, useState, useCallback } from "react";
import FontFaceObserver from "fontfaceobserver";
import { AnimatedLoadingScreenProps } from "./types";

interface Particle {
  x: number;
  y: number;
  size: number;
  targetX: number;
  targetY: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  color: string;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

const AnimatedLoadingScreen: React.FC<AnimatedLoadingScreenProps> = ({ onLoadComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackTextRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const primaryFont = "Arvo";
  const fallbackFonts = "sans-serif";
  const serviceName = "Routhme.io";
  const fontSize = 48;
  const colors = ["#6a11cb", "#2575fc", "#00c6fb", "#005bea", "#333333"];

  const loadFont = (font: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(
        " ",
        "+"
      )}&display=swap`;
      link.rel = "stylesheet";
      link.onload = () => resolve();
      link.onerror = () => reject();
      document.head.appendChild(link);
    });
  };

  const setStyles = (font: string): void => {
    const dynamicStyles = document.createElement("style");
    dynamicStyles.textContent = `
      body, #fallback-text {
        font-family: '${font}', ${fallbackFonts};
      }
    `;
    document.head.appendChild(dynamicStyles);
  };

  class ParticleClass implements Particle {
    size: number;
    speed: number;
    velocityX: number;
    velocityY: number;
    color: string;

    constructor(public x: number, public y: number, public targetX: number, public targetY: number) {
      this.x = Math.random() * 400;
      this.y = Math.random() * 100;
      this.size = Math.random() * 1 + 0.5;
      this.speed = Math.random() * 0.7 + 0.01;
      this.velocityX = 0;
      this.velocityY = 0;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(): void {
      this.velocityX = (this.targetX - this.x) * this.speed;
      this.velocityY = (this.targetY - this.y) * this.speed;
      this.x += this.velocityX;
      this.y += this.velocityY;
    }

    draw(ctx: CanvasRenderingContext2D): void {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const init = useCallback((font: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = `${fontSize}px '${font}', ${fallbackFonts}`;
    ctx.fillStyle = "#333333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(serviceName, canvas.width / 2, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const newParticles: Particle[] = [];
    for (let y = 0; y < imageData.height; y += 1) {
      for (let x = 0; x < imageData.width; x += 1) {
        if (imageData.data[(y * imageData.width + x) * 4 + 3] > 128) {
          newParticles.push(new ParticleClass(x, y, x, y));
        }
      }
    }
    setParticles(newParticles);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.update();
      particle.draw(ctx);
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [particles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 400;
      canvas.height = 100;
    }

    const initFont = async (font: string) => {
      try {
        await loadFont(font);
        setStyles(font);
        const fontObserver = new FontFaceObserver(font);
        await fontObserver.load(null, 5000);
        console.log(`${font} font has loaded.`);
        setFontLoaded(true);
        init(font);
      } catch (e) {
        console.error("Font loading failed:", e);
        if (fallbackTextRef.current) {
          fallbackTextRef.current.style.display = "block";
        }
        if (canvas) {
          canvas.style.display = "none";
        }
      }
    };

    initFont(primaryFont);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [init]);

  useEffect(() => {
    if (fontLoaded && particles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);

      const timer = setTimeout(() => {
        const fadeOutInterval = setInterval(() => {
          setOpacity((prevOpacity) => {
            if (prevOpacity <= 0) {
              clearInterval(fadeOutInterval);
              onLoadComplete();
              return 0;
            }
            return prevOpacity - 0.05;
          });
        }, 20);
      }, 1500);

      return () => {
        clearTimeout(timer);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [fontLoaded, particles, animate, onLoadComplete]);

  return (
    <div
      className="fixed inset-0 flex flex-col justify-center items-center bg-white"
      style={{ opacity: opacity, transition: "opacity 0.5s ease-out" }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-[100px] h-[50px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 50"
            width="100"
            height="50"
          >
            <defs>
              <linearGradient
                id="gradient1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#6a11cb" />
                <stop offset="100%" stopColor="#2575fc" />
              </linearGradient>
              <linearGradient
                id="gradient2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#00c6fb" />
                <stop offset="100%" stopColor="#005bea" />
              </linearGradient>
              <style>
                {`
                  @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  .loop1 { animation: rotate 4s linear infinite; }
                  .loop2 { animation: rotate 4s linear infinite reverse; }
                `}
              </style>
            </defs>
            <g transform="translate(40, 25)">
              <g className="loop1">
                <path
                  fill="url(#gradient1)"
                  d="M-20,0 A20,20 0 1,1 20,0 A20,20 0 1,1 -20,0 Z"
                />
              </g>
            </g>
            <g transform="translate(60, 25)">
              <g className="loop2">
                <path
                  fill="url(#gradient2)"
                  d="M-20,0 A20,20 0 1,1 20,0 A20,20 0 1,1 -20,0 Z"
                />
              </g>
            </g>
          </svg>
        </div>
        <div className="relative w-[400px] h-[100px]">
          <canvas ref={canvasRef} className="absolute top-0 left-0"></canvas>
          {!fontLoaded && (
            <div
              ref={fallbackTextRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-gray-800 hidden"
            >
              {serviceName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimatedLoadingScreen;