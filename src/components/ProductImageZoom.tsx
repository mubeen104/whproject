import React, { useState, useRef, useCallback } from 'react';

interface ProductImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProductImageZoom: React.FC<ProductImageZoomProps> = ({ 
  src, 
  alt, 
  className = "" 
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsZoomed(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZoomed(false);
  }, []);

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden cursor-zoom-in ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-transform duration-300 ease-out ${
          isZoomed ? 'scale-150' : 'scale-100'
        }`}
        style={{
          transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center center',
        }}
        draggable={false}
      />
      
      {/* Zoom indicator overlay */}
      {isZoomed && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            Zoom Active
          </div>
        </div>
      )}
    </div>
  );
};