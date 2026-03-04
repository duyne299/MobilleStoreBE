'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AutoHideHeaderProps {
  children: React.ReactNode;
}

export function AutoHideHeader({ children }: AutoHideHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        // Luôn hiện header khi ở đầu trang
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scroll lên - hiện header
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll xuống - ẩn header
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, [lastScrollY]);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : '-100%' }}

      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md"
    >
      {children}
    </motion.div>
  );
}