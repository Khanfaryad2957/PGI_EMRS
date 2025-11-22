const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'backdrop-blur-sm bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white border border-white/20 shadow-lg hover:shadow-xl focus:ring-primary-500',
    secondary: 'backdrop-blur-sm bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white border border-white/20 shadow-lg hover:shadow-xl focus:ring-secondary-500',
    success: 'backdrop-blur-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border border-white/20 shadow-lg hover:shadow-xl focus:ring-green-500',
    danger: 'backdrop-blur-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border border-white/20 shadow-lg hover:shadow-xl focus:ring-red-500',
    warning: 'backdrop-blur-sm bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white border border-white/20 shadow-lg hover:shadow-xl focus:ring-yellow-500',
    outline: 'backdrop-blur-sm border-2 border-primary-600/60 text-primary-600 bg-white/30 hover:bg-white/50 focus:ring-primary-500 shadow-sm hover:shadow-md',
    ghost: 'backdrop-blur-sm text-primary-600 bg-white/20 hover:bg-white/40 focus:ring-primary-500 border border-transparent hover:border-white/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;

