import React from 'react';

function Button({ children, onClick, type = 'button', variant = 'primary', className = '' }) {
  const baseClasses = "px-6 py-3 rounded-full font-bold transition duration-300 ease-in-out";
  let variantClasses = "";

  switch (variant) {
    case 'primary':
      variantClasses = "bg-primary-accent text-white hover:bg-opacity-90";
      break;
    case 'secondary':
      variantClasses = "border border-primary-accent text-primary-accent hover:bg-primary-accent hover:text-white";
      break;
    case 'ghost':
      variantClasses = "text-primary-accent hover:bg-primary-accent hover:bg-opacity-10";
      break;
    case 'danger':
      variantClasses = "bg-red-600 text-white hover:bg-red-700";
      break;
    default:
      variantClasses = "bg-primary-accent text-white hover:bg-opacity-90";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;