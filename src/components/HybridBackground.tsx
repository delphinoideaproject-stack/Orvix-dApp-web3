import React from 'react';

export const HybridBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[var(--bg)]">
      {/* Fixed Chart Background for Dark Mode */}
      <div className="absolute inset-0 opacity-[0.10] [mask-image:radial-gradient(ellipse_80%_70%_at_center,black_30%,transparent_100%)]">
        <svg viewBox="0 0 1400 700" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <g id="bg-candles">
            {Array.from({ length: 28 }).map((_, i) => {
              const x = i * (1400 / 28) + (1400 / 28) / 2;
              const isBull = Math.random() > 0.42;
              const color = isBull ? '#06b6d4' : '#ef4444';
              const wickTop = 80 + Math.random() * 200;
              const wickBot = wickTop + 150 + Math.random() * 300;
              const bodyTop = wickTop + (wickBot - wickTop) * (0.1 + Math.random() * 0.3);
              const bodyH = (wickBot - wickTop) * (0.3 + Math.random() * 0.4);
              const bw = (1400 / 28) * 0.45;
              const delay = (Math.random() * 5).toFixed(2);
              const dur = (4 + Math.random() * 4).toFixed(2);
              
              return (
                <g 
                  key={i} 
                  style={{ 
                    animation: `candleFloat ${dur}s ease-in-out ${delay}s infinite`
                  }}
                >
                  <line x1={x} x2={x} y1={wickTop} y2={wickBot} stroke={color} strokeWidth="1" opacity="0.4" />
                  <rect x={x - bw/2} y={bodyTop} width={bw} height={bodyH} fill={color} opacity="0.55" />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <style>{`
        @keyframes candleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
      `}</style>
    </div>
  );
};
