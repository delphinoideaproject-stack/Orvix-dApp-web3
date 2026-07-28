import React, { useState, useRef } from 'react';
import { Token } from '../types';
import { formatGlobalNumber } from '../lib/formatNumber';
import { OrvixLogo } from './OrvixLogo';
import { Button } from './Button';
import { X, Download, Check, Copy, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareBottomSheetProps {
  token: Token;
  isOpen: boolean;
  onClose: () => void;
}


export function ShareBottomSheet({ token, isOpen, onClose }: ShareBottomSheetProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const offset = -now.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const tzString = `(GMT${offset >= 0 ? '+' : '-'}${offsetHours})`;
  const formattedDateTime = `${dateStr} ${timeStr} ${tzString}`;
  const projectUrl = window.location.href;
  const isPositive = token.priceChange >= 0;
  const liquidityText = formatGlobalNumber(token.liquidityAdded || token.liquidityLockDuration || '100% Locked (Verified)');
  const marketCapText = formatGlobalNumber(token.marketCap || '$4.2M');
  const volumeText = formatGlobalNumber(token.volume24h || '$1.28M');
  const listedTimeText = token.listedAt || 'Just now';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopySuccess(true);
    window.dispatchEvent(new CustomEvent('orvix-toast', { detail: 'Shareable link copied to clipboard!' }));
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY;
      if (diff > 0) {
        setTouchCurrentY(diff);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchCurrentY > 100) {
      onClose();
    }
    setTouchStartY(null);
    setTouchCurrentY(0);
  };

  const handleDownloadCard = async () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // 1. Draw Wallpaper Image or Dark Background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const wallpaperImg = new Image();
      wallpaperImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        wallpaperImg.onload = () => {
          ctx.drawImage(wallpaperImg, 0, 0, canvas.width, canvas.height);
          resolve(true);
        };
        wallpaperImg.onerror = () => resolve(true);
        wallpaperImg.src = token.wallpaper || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80';
      });

      // Dark Overlay rgba(0,0,0,0.75)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Top Header: [Orvix Logo] Orvix Labs [timestamp]
      const orvixLogoImg = new Image();
      orvixLogoImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        orvixLogoImg.onload = () => {
          ctx.drawImage(orvixLogoImg, 60, 45, 40, 40);
          resolve(true);
        };
        orvixLogoImg.onerror = () => resolve(true);
        orvixLogoImg.src = 'https://raw.githubusercontent.com/orvix-labs/Orvix-Icon/main/orvix.svg';
      });

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Orvix Labs', 115, 65);

      // Timestamp top right
      const dateTimeText = formattedDateTime;
      ctx.textAlign = 'right';
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#d4d4d8';
      ctx.fillText(dateTimeText, canvas.width - 60, 65);
      ctx.restore();

      // 3. Middle Section: [Token Icon] BTS/USST
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 180, 40, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const tokenImg = new Image();
      tokenImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        tokenImg.onload = () => {
          ctx.drawImage(tokenImg, 60, 140, 80, 80);
          resolve(true);
        };
        tokenImg.onerror = () => resolve(true);
        tokenImg.src = token.logo || 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png';
      });
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 64px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const pairText = `${token.symbol}/${token.pair.split('/')[1] || 'USDT'}`;
      ctx.fillText(pairText, 160, 185);
      ctx.restore();

      // 4. Lower Section: PRICE, Percentage, Mini chart
      ctx.save();
      ctx.fillStyle = '#a1a1aa';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText('PRICE', 60, 310);

      const priceStr = `$${formatGlobalNumber(token.price)}`;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 72px monospace';
      ctx.fillText(priceStr, 60, 380);

      const priceWidth = ctx.measureText(priceStr).width;
      
      const changeStr = `${token.priceChange >= 0 ? '+' : ''}${formatGlobalNumber(token.priceChange)}%`;
      ctx.fillStyle = token.priceChange >= 0 ? '#34d399' : '#fb7185';
      ctx.font = '900 52px Inter, sans-serif';
      ctx.fillText(changeStr, 60 + priceWidth + 30, 380);
      
      const changeWidth = ctx.measureText(changeStr).width;
      ctx.restore();

      // Mini chart line
      const chartX = 60 + priceWidth + 30 + changeWidth + 40;
      const chartY = 330;
      ctx.save();
      ctx.strokeStyle = token.priceChange >= 0 ? '#34d399' : '#fb7185';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      if (token.priceChange >= 0) {
        ctx.moveTo(chartX, chartY + 50);
        ctx.bezierCurveTo(chartX + 40, chartY + 40, chartX + 80, chartY + 60, chartX + 120, chartY + 20);
        ctx.bezierCurveTo(chartX + 160, chartY + 30, chartX + 180, chartY - 10, chartX + 200, chartY + 10);
      } else {
        ctx.moveTo(chartX, chartY + 10);
        ctx.bezierCurveTo(chartX + 40, chartY + 20, chartX + 80, chartY - 10, chartX + 120, chartY + 40);
        ctx.bezierCurveTo(chartX + 160, chartY + 30, chartX + 180, chartY + 60, chartX + 200, chartY + 50);
      }
      ctx.shadowColor = token.priceChange >= 0 ? 'rgba(52,211,153,0.5)' : 'rgba(251,113,133,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.stroke();
      ctx.restore();

      // 5. QR Code Bottom Right
      const qrSize = 130;
      const qrX = canvas.width - 60 - qrSize;
      const qrY = 460;
      
      const svgElement = document.getElementById(`share-qr-svg-${token.id}`);
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const blobURL = URL.createObjectURL(svgBlob);
        
        await new Promise((resolve) => {
          const qrImg = new Image();
          qrImg.onload = () => {
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            URL.revokeObjectURL(blobURL);
            resolve(true);
          };
          qrImg.onerror = () => {
            URL.revokeObjectURL(blobURL);
            resolve(true);
          };
          qrImg.src = blobURL;
        });
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${token.symbol.toLowerCase()}-orvix-share-card.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      window.dispatchEvent(new CustomEvent('orvix-toast', { detail: 'Official ORVIX Share Card downloaded successfully!' }));
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate share card:', err);
      window.dispatchEvent(new CustomEvent('orvix-toast', { detail: 'Failed to generate share card. Please try again.' }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: touchCurrentY > 0 ? `translateY(${touchCurrentY}px)` : undefined,
          transition: touchCurrentY === 0 ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
        className="relative w-full max-w-xl bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
      >
        {/* Mobile Swipe Handle */}
        <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mt-3 mb-1 sm:hidden cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="flex justify-end pt-4 px-4 pb-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer z-10"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Live Preview Card */}
          <div className="relative w-full aspect-[600/315] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between p-6 font-sans font-bold text-white">
            {/* Token Wallpaper */}
            <img
              src={token.wallpaper || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80'}
              alt={token.name}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Overlay rgba(0,0,0,0.75) */}
            <div className="absolute inset-0 bg-black/75" />
            
            {/* Top Row: [Orvix Logo] Orvix Labs [timestamp] */}
            <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <OrvixLogo className="w-6 h-6 text-white" />
                <span className="font-bold text-white tracking-wide text-sm sm:text-lg">Orvix Labs</span>
              </div>
              <div className="text-[10px] sm:text-sm font-mono text-zinc-300 font-bold">
                {formattedDateTime}
              </div>
            </div>

            {/* Middle Row: [Token Icon] BTS/USST */}
            <div className="relative z-10 flex items-center gap-4 mt-6">
              <img 
                src={token.logo || 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'} 
                alt={token.symbol}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white/20 shadow-lg"
                referrerPolicy="no-referrer"
              />
              <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {token.symbol}/{token.pair.split('/')[1] || 'USDT'}
              </div>
            </div>

            {/* Lower Row: PRICE, Percentage, Mini chart & QR Code */}
            <div className="relative z-10 mt-auto pt-4 flex items-end justify-between">
              <div>
                <div className="text-[10px] sm:text-xs uppercase font-bold text-zinc-400 tracking-widest mb-1">PRICE</div>
                <div className="flex items-end gap-4">
                  <div className="text-3xl sm:text-5xl font-black font-mono text-white leading-none">
                    ${formatGlobalNumber(token.price)}
                  </div>
                  <div className={`text-xl sm:text-3xl font-black leading-none mb-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}{formatGlobalNumber(token.priceChange)}%
                  </div>
                  {/* Mini chart line */}
                  <div className="ml-2 w-20 h-6 sm:w-28 sm:h-10 mb-1 flex items-center">
                    <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path 
                        d={isPositive ? "M0,25 C20,20 40,30 60,10 S80,15 100,5" : "M0,5 C20,10 40,0 60,20 S80,15 100,25"}
                        fill="none" 
                        stroke={isPositive ? "#34d399" : "#fb7185"} 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        style={{ filter: `drop-shadow(0px 4px 6px ${isPositive ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'})` }}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Footer QR without box container */}
              <div className="flex items-center">
                <QRCodeSVG
                  value={`https://orvix.io/token/${token.contract}`}
                  size={70}
                  level="M"
                  includeMargin={false}
                  bgColor="transparent"
                  fgColor="#ffffff"
                />
              </div>
            </div>
          </div>
          
          {/* Three iOS-style Circle Icon Buttons */}
          <div className="flex items-center justify-center gap-8 py-2">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 flex items-center justify-center text-zinc-200 group-hover:scale-105 transition-all shadow-md">
                {copySuccess ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                {copySuccess ? 'Copied!' : 'Copy Link'}
              </span>
            </button>
            {/* Download */}
            <button
              onClick={handleDownloadCard}
              disabled={isGenerating}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 flex items-center justify-center text-zinc-200 group-hover:scale-105 transition-all shadow-md">
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                ) : downloadSuccess ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                {isGenerating ? 'Saving...' : downloadSuccess ? 'Saved!' : 'Download'}
              </span>
            </button>
            {/* Share (Native) */}
            <button
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: `${token.name} (${token.symbol}) on Orvix`,
                      text: `Check out ${token.name} (${token.symbol}) on Orvix Labs! Price: ${formatGlobalNumber(token.price)}`,
                      url: projectUrl,
                    });
                  } catch (e) {
                    // cancelled or failed
                  }
                } else {
                  handleCopyLink();
                }
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 flex items-center justify-center text-zinc-200 group-hover:scale-105 transition-all shadow-md">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                Share
              </span>
            </button>
          </div>
          <div className="text-center text-[11px] text-zinc-500 font-medium pb-1">
            Shareable on X · Telegram · Discord
          </div>
        </div>

        {/* Hidden QR code for canvas rendering */}
        <div className="hidden">
          <QRCodeSVG
            id={`share-qr-svg-${token.id}`}
            value={projectUrl}
            size={400}
            level="M"
            includeMargin={false}
            bgColor="transparent"
            fgColor="#ffffff"
          />
        </div>
      </div>
    </div>
  );
}
