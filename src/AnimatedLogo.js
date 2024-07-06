import React, { useEffect, useRef, useState } from 'react';
import FontFaceObserver from 'fontfaceobserver';

const AnimatedLogo = () => {
  const canvasRef = useRef(null);
  const fallbackTextRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [fontLoaded, setFontLoaded] = useState(false);
  const primaryFont = 'Arvo';
  const fallbackFonts = 'sans-serif';
  const serviceName = "Routhme.io";
  const fontSize = 48;
  const colors = ['#6a11cb', '#2575fc', '#00c6fb', '#005bea', '#333333'];

  const loadFont = (font) => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}&display=swap`;
      link.rel = 'stylesheet';
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  };

  const setStyles = (font) => {
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
      body, #fallback-text {
        font-family: '${font}', ${fallbackFonts};
      }
    `;
    document.head.appendChild(dynamicStyles);
  };

  const Particle = class {
    constructor(x, y, targetX, targetY) {
      this.x = Math.random() * canvasRef.current.width;
      this.y = Math.random() * canvasRef.current.height;
      this.size = Math.random() * 1 + 0.5;
      this.targetX = targetX;
      this.targetY = targetY;
      this.speed = Math.random() * 0.5 + 0.01;
      this.velocityX = 0;
      this.velocityY = 0;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.velocityX = (this.targetX - this.x) * this.speed;
      this.velocityY = (this.targetY - this.y) * this.speed;
      this.x += this.velocityX;
      this.y += this.velocityY;
    }

    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const init = (font) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.font = `${fontSize}px '${font}', ${fallbackFonts}`;
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillText(serviceName, 90, 50);

    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const newParticles = [];
    for (let y = 0; y < imageData.height; y += 1) {
      for (let x = 0; x < imageData.width; x += 1) {
        if (imageData.data[(y * imageData.width + x) * 4 + 3] > 128) {
          newParticles.push(new Particle(x, y, x, y));
        }
      }
    }
    setParticles(newParticles);
  };

  const animate = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    particles.forEach((particle) => {
      particle.update();
      particle.draw(ctx);
    });

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const initFont = async (font) => {
      try {
        await loadFont(font);
        setStyles(font);
        const fontObserver = new FontFaceObserver(font);
        await fontObserver.load(null, 5000);
        console.log(`${font} font has loaded.`);
        setFontLoaded(true);
        init(font);
      } catch (e) {
        console.error('Font loading failed:', e);
        if (fallbackTextRef.current) {
          fallbackTextRef.current.style.display = 'block';
        }
        if (canvasRef.current) {
          canvasRef.current.style.display = 'none';
        }
      }
    };

    initFont(primaryFont);
    animate();

    setTimeout(() => {
      if (particles.length === 0) {
        console.warn('Font loading timed out. Using fallback.');
        if (fallbackTextRef.current) {
          fallbackTextRef.current.style.display = 'block';
        }
        if (canvasRef.current) {
          canvasRef.current.style.display = 'none';
        }
      }
    }, 5000);
  }, [particles.length]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-5 bg-white">
      <div id="logo-container" className="relative w-[400px] h-[100px] mb-5">
        <svg id="svg-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100" className="absolute top-0 left-0">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#6a11cb', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#2575fc', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00c6fb', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#005bea', stopOpacity: 1 }} />
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
          <g transform="translate(40, 50)">
            <g className="loop1">
              <path fill="url(#gradient1)" d="M-20,0 A20,20 0 1,1 20,0 A20,20 0 1,1 -20,0 Z" />
            </g>
          </g>
          <g transform="translate(60, 50)">
            <g className="loop2">
              <path fill="url(#gradient2)" d="M-20,0 A20,20 0 1,1 20,0 A20,20 0 1,1 -20,0 Z" />
            </g>
          </g>
        </svg>
        <canvas id="canvas" ref={canvasRef} width="400" height="100" className="absolute top-0 left-0"></canvas>
        {!fontLoaded && <div id="fallback-text" ref={fallbackTextRef} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-gray-800 hidden">Customizable Logo</div>}
      </div>
    </div>
  );
};

export default AnimatedLogo;
