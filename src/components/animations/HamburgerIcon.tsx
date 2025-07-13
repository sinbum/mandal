'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface HamburgerIconProps {
  isOpen: boolean;
  onClick: () => void;
  size?: number;
  className?: string;
}

const HamburgerIcon: React.FC<HamburgerIconProps> = ({
  isOpen,
  onClick,
  size = 28,
  className = "text-gray-700"
}) => {
  const t = useTranslations('common');

  const topLineVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: 45, y: 6 }
  };

  const middleLineVariants = {
    closed: { opacity: 1 },
    open: { opacity: 0 }
  };

  const bottomLineVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: -45, y: -6 }
  };

  return (
    <motion.button
      className={`${className}`}
      onClick={onClick}
      aria-label={t('menu')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <motion.path
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          d="M4 6h16"
          variants={topLineVariants}
          animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.path
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          d="M4 12h16"
          variants={middleLineVariants}
          animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.path
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          d="M4 18h16"
          variants={bottomLineVariants}
          animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </svg>
    </motion.button>
  );
};

export default HamburgerIcon;