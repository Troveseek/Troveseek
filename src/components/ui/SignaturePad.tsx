'use client';

import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  onSignatureChange: (signature: string | null) => void;
  width?: number;
  height?: number;
}

export default function SignaturePad({ onSignatureChange, width = 400, height = 200 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    // initialize canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Note: preventDefault might not work on passive touch events, but we have touch-action: none on canvas
    const ctx = getContext();
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = getContext();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (canvas) {
      onSignatureChange(canvas.toDataURL('image/jpeg', 0.8));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setHasDrawn(false);
    onSignatureChange(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let imgWidth = img.width;
        let imgHeight = img.height;
        
        // Scale down to fit inside the canvas (leaving some padding)
        const maxWidth = canvas.width - 40;
        const maxHeight = canvas.height - 40;
        
        if (imgWidth > maxWidth || imgHeight > maxHeight) {
          if (imgWidth > imgHeight) {
            imgHeight = Math.round((imgHeight * maxWidth) / imgWidth);
            imgWidth = maxWidth;
          } else {
            imgWidth = Math.round((imgWidth * maxHeight) / imgHeight);
            imgHeight = maxHeight;
          }
        }
        
        // Draw in center
        const x = (canvas.width - imgWidth) / 2;
        const y = (canvas.height - imgHeight) / 2;
        
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
        
        // Update state
        setHasDrawn(true);
        onSignatureChange(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    // Reset file input so they can upload the same file again if needed
    e.target.value = '';
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
        <label style={{
          display: 'inline-block',
          padding: '6px 16px',
          background: 'var(--clr-surface-2, #f5f5f5)',
          border: '1px solid var(--clr-border, #ddd)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--clr-text, #333)'
        }}>
          Upload Stamp/Image
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
        <span style={{ fontSize: '13px', color: '#888' }}>Upload an image, then sign over or next to it!</span>
      </div>

      <div style={{
        border: '2px dashed var(--clr-border, #ddd)',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        background: '#fff',
        minHeight: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasDrawn && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
            fontSize: '14px',
            pointerEvents: 'none',
            textAlign: 'center',
          }}>
            ✍️ Draw your signature or upload a stamp
          </div>
        )}
        {/* Guide line */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '10%',
          right: '10%',
          height: '1px',
          background: '#e0e0e0',
          pointerEvents: 'none',
        }} />
      </div>
      {hasDrawn && (
        <button
          onClick={clear}
          type="button"
          style={{
            marginTop: '8px',
            padding: '6px 16px',
            background: 'none',
            border: '1px solid var(--clr-border, #ddd)',
            borderRadius: '6px',
            color: 'var(--clr-text-muted, #888)',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
