import React from "react";

const AnimatedLogo = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 60 60"
        width="100"
        height="100"
        className="mr-2"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6a11cb" />
            <stop offset="100%" stopColor="#2575fc" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
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
        <g transform="translate(20, 30)">
          <g className="loop1">
            <path
              fill="url(#gradient1)"
              d="M-10,0 A10,10 0 1,1 10,0 A10,10 0 1,1 -10,0 Z"
            />
          </g>
        </g>
        <g transform="translate(30, 30)">
          <g className="loop2">
            <path
              fill="url(#gradient2)"
              d="M-10,0 A10,10 0 1,1 10,0 A10,10 0 1,1 -10,0 Z"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default AnimatedLogo;
