import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let requestRef: number;
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const updatePosition = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      setPosition({ x: cursorX, y: cursorY });
      requestRef = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', onMouseMove);
    requestRef = requestAnimationFrame(updatePosition);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(requestRef);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-4 h-4 bg-primary rounded-full pointer-events-none z-[9999] mix-blend-screen"
      style={{
        transform: `translate3d(${position.x - 8}px, ${position.y - 8}px, 0)`,
        boxShadow: '0 0 10px rgba(255,0,153,0.8)',
      }}
    />
  );
}
