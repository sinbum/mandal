import React from 'react';
import { MobileLayoutProps } from '@/types/ui';
import { LAYOUT } from '@/lib/constants';

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  header,
  footer,
  className = '',
}) => {
  const headerHeight = header ? `${LAYOUT.HEADER_HEIGHT}px` : '0px';
  const footerHeight = footer ? `${LAYOUT.FOOTER_HEIGHT}px` : '0px';
  
  return (
    <div className={`w-full h-full flex flex-col bg-white ${className}`}>
      {header && (
        <div className="w-full">
          {header}
        </div>
      )}
      
      <main 
        className="flex-1 overflow-y-auto overscroll-contain p-4"
        style={{
          height: `calc(100vh - ${headerHeight} - ${footerHeight})`,
        }}
      >
        {children}
      </main>
      
      {footer && (
        <div className="w-full bg-white">
          {footer}
        </div>
      )}
    </div>
  );
};

export default MobileLayout; 