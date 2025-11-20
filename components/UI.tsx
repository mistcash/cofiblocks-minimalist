import React, { ReactNode } from 'react';

export const baseUIBoxClasses = "w-full rounded-lg font-medium transition-colors flex items-center justify-center gap-2";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  className?: string;
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const baseClasses = `${baseUIBoxClasses} cursor-pointer py-4 px-5`;
  const variants = {
    primary: "bg-yellow-400 text-black hover:bg-yellow-500",
    secondary: "bg-blue-700 text-white hover:bg-blue-600",
    tertiary: "bg-gray-700 text-white hover:bg-gray-600",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
