import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [showBanner, setShowBanner] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsReconnecting(true);
    
    // Simulate checking connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (navigator.onLine) {
      setIsOnline(true);
      setTimeout(() => setShowBanner(false), 2000);
    }
    
    setIsReconnecting(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-0 left-0 right-0 z-[100] ${
          isOnline ? 'bg-emerald-500' : 'bg-slate-800'
        } text-white`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5" />
                <span className="font-medium">You're back online!</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5" />
                <div>
                  <span className="font-medium">You're offline</span>
                  <p className="text-sm text-white/70 hidden sm:block">
                    Some features may be unavailable
                  </p>
                </div>
              </>
            )}
          </div>

          {!isOnline && (
            <button
              onClick={handleRetry}
              disabled={isReconnecting}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isReconnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for online status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default OfflineIndicator;
