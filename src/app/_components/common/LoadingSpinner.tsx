'use client';

import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  color?: string;
  size?: number;
}

export default function LoadingSpinner({ color = "#982cd6", size = 60 }: LoadingSpinnerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <div 
        className="animate-spin rounded-full border-4 border-gray-300"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderTopColor: color,
          borderRightColor: color,
        }}
      />
    </div>
  );
} 