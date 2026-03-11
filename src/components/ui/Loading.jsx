import { cn } from '../../utils';

const Loading = ({ 
  size = 'md', 
  variant = 'spinner',
  className,
  text 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
        <svg 
          className={cn('animate-spin text-primary-600', sizes[size])} 
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
        {text && <p className="text-sm text-gray-600">{text}</p>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center space-x-1', className)}>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
        <div className={cn('bg-primary-600 rounded-full animate-pulse', sizes[size])} />
        {text && <p className="text-sm text-gray-600">{text}</p>}
      </div>
    );
  }

  return null;
};

// Skeleton loading component
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
};

// Full page loading overlay
export const LoadingOverlay = ({ isLoading, children, text }) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <Loading size="lg" text={text} />
      </div>
    </div>
  );
};

export default Loading;