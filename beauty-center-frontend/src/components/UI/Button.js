import React from 'react';
import { clsx } from 'clsx';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200',
    outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    link: 'text-primary-600 underline-offset-4 hover:underline',
  };

  const sizes = {
    sm: 'h-9 rounded-md px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );

  const iconClasses = clsx(
    'h-4 w-4',
    size === 'sm' && 'h-3 w-3',
    size === 'lg' && 'h-5 w-5'
  );

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="small" className="mr-2" />
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={clsx(iconClasses, children && 'mr-2')} />
      )}
      
      {children}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={clsx(iconClasses, children && 'ml-2')} />
      )}
    </button>
  );
};

export default Button;