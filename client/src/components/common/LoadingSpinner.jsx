import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-teal-200 border-t-teal-600 rounded-full animate-spin`}
      />
      {text && <p className="mt-3 text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
