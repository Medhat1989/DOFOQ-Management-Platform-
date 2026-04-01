import React from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
      {/* Animated Background Light */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px]"
      />

      <div className="relative flex flex-col items-center">
        {/* Logo Container with Moving Light Effect */}
        <div className="relative p-8">
          {/* Rotating Light Border */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-400 border-r-indigo-400/30 blur-sm"
          />
          
          <motion.img
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            src="https://i.ibb.co/k2nBDqYK/Black-and-Gold-Elegant-Florist-Business-Card-4-removebg-preview.png"
            alt="Logo"
            className="w-48 h-48 object-contain relative z-10"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Slogan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-6 text-center"
        >
          <h2 className="text-2xl font-light tracking-[0.3em] text-indigo-100 uppercase">
            All-In-One Management Platform
          </h2>
          
          {/* Loading Bar */}
          <div className="mt-8 w-48 h-0.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
