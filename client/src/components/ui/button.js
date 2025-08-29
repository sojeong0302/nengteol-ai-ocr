import React from 'react';

export const Button = ({ children, variant = "default", size = "default", className = "", onClick, ...props }) => {
  const baseClasses = "btn";
  
  const variants = {
    default: "btn-primary",
    primary: "btn-primary", 
    outline: "btn-outline",
    destructive: "btn-outline text-red-600 hover:bg-red-50"
  };

  const sizes = {
    default: "",
    sm: "btn-sm"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};