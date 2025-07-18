import React from 'react';
import { MobileLayoutProps } from '@/types/ui';

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  header,
  footer,
  className = '',
  disableScroll = false,
}) => {
  return (
    <div className={`w-full h-[100dvh] flex flex-col bg-white ${className}`}>
      {header && (
        <div className="w-full flex-shrink-0">
          {header}
        </div>
      )}
      
      <main className={`flex-1 min-h-0 ${disableScroll ? 'overflow-hidden' : 'overflow-y-auto'} ${footer ? 'pb-16' : ''}`}>
        {children}
      </main>
      
      {footer && (
        <div className="w-full flex-shrink-0 bg-white">
          {footer}
        </div>
      )}
    </div>
  );
};

export default MobileLayout; 