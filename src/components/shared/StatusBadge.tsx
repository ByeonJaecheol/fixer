import React from 'react';

interface StatusBadgeProps {
  status: string | null | undefined;
  colorMapping?: Record<string, string>;
  fallback?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  colorMapping = {}, 
  fallback = '-' 
}) => {
  if (!status) return <span>{fallback}</span>;

  const defaultColorClass = "bg-gray-100 text-gray-800";
  const colorClass = colorMapping[status] || defaultColorClass;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge; 