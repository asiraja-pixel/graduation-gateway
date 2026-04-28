import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  existingSignature?: string; // pre-fill if editing
  label?: string;
  height?: number; // canvas height in px, default 150
  disabled?: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  existingSignature,
  label,
  height = 150,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  const setupCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on CSS size for proper resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = height;

    // Set background to white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw baseline guide
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    const baselineY = (canvas.height * 2) / 3;
    ctx.moveTo(20, baselineY);
    ctx.lineTo(canvas.width - 20, baselineY);
    ctx.stroke();

    // Set default drawing styles
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    return ctx;
  }, [height]);

  const drawPlaceholder = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sign here...', canvas.width / 2, canvas.height / 2);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = setupCanvas(canvas);
    if (!ctx) return;

    if (existingSignature) {
      const img = new Image();
      img.src = existingSignature;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasContent(true);
      };
    } else {
      drawPlaceholder(canvas);
      setHasContent(false);
    }
  }, [setupCanvas, drawPlaceholder, existingSignature]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    // Scale coordinates based on canvas internal width/height vs CSS display size
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    return { x, y };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear placeholder on first stroke
    if (!hasContent) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Redraw baseline guide
      ctx.beginPath();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      const baselineY = (canvas.height * 2) / 3;
      ctx.moveTo(20, baselineY);
      ctx.lineTo(canvas.width - 20, baselineY);
      ctx.stroke();

      // Reset styles for drawing
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      setHasContent(true);
    }

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    lastPos.current = { x, y };

    // Draw a dot for single taps
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
  }, [disabled, hasContent]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    if (!lastPos.current) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPos.current = { x, y };
  }, [isDrawing, disabled]);

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setupCanvas(canvas);
    drawPlaceholder(canvas);
    setHasContent(false);
    onClear?.();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div 
        className={cn(
          "border border-input rounded-lg overflow-hidden bg-white",
          disabled && "opacity-50"
        )}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          style={{
            display: 'block',
            width: '100%',
            height: `${height}px`,
            touchAction: 'none',
            cursor: disabled ? 'default' : 'crosshair',
            pointerEvents: disabled ? 'none' : 'auto',
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={disabled}
        >
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={!hasContent || disabled}
        >
          Apply Signature
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
