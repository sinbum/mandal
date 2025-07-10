'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends Omit<ButtonProps, 'asChild'> {
  motionProps?: Omit<HTMLMotionProps<"button">, 'children' | 'className' | 'onClick'>;
  animationEnabled?: boolean;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, motionProps = {}, animationEnabled = true, className, ...buttonProps }, ref) => {
    const defaultMotionProps: HTMLMotionProps<"button"> = {
      whileHover: animationEnabled ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {},
      whileTap: animationEnabled ? {
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {},
      initial: { scale: 1 },
      ...motionProps
    };

    // Button 컴포넌트의 스타일을 직접 적용
    const buttonVariants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };

    const buttonSizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    const variant = buttonProps.variant || "default";
    const size = buttonProps.size || "default";

    return (
      <motion.button
        ref={ref}
        className={cn(
          // 기본 버튼 스타일
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          // variant 스타일
          buttonVariants[variant as keyof typeof buttonVariants],
          // size 스타일
          buttonSizes[size as keyof typeof buttonSizes],
          className
        )}
        {...defaultMotionProps}
        {...buttonProps}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;