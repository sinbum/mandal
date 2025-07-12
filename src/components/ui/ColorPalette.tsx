import React from 'react';
import { ColorPaletteProps } from '@/types/ui';
import { COLOR_PALETTE } from '@/lib/colors';

const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onColorSelect,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {COLOR_PALETTE.map((color, index) => (
        <button
          key={color}
          type="button"
          onClick={() => onColorSelect(color)}
          className={`
            w-12 h-12 aspect-square
            rounded-full border-2 transition-all duration-200
            ${selectedColor === color ? 'border-blue-500 scale-110 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
            hover:scale-110 hover:shadow-md active:scale-95
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transform-gpu
          `}
          style={{ backgroundColor: color }}
          aria-label={`색상 ${index + 1}번 선택`}
          aria-pressed={selectedColor === color}
        />
      ))}
    </div>
  );
};

export default ColorPalette;
