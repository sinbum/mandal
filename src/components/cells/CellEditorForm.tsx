import React, { useState } from 'react';
import { CellEditorFormProps } from '@/types/mandalart';
import { LIMITS } from '@/lib/constants';
import { Button } from '../ui/Button';
import InputField from '../ui/InputField';
import TextArea from '../ui/TextArea';
import ColorPalette from '../ui/ColorPalette';

const CellEditorForm: React.FC<CellEditorFormProps> = ({
  cell,
  onSave,
  onCancel,
}) => {
  const [topic, setTopic] = useState(cell.topic || '');
  const [memo, setMemo] = useState(cell.memo || '');
  const [color, setColor] = useState(cell.color || '');
  const [imageUrl, setImageUrl] = useState(cell.imageUrl || '');
  const [isCompleted, setIsCompleted] = useState(cell.isCompleted || false);
  const [isUploading, setIsUploading] = useState(false);

  // 이미지 업로드 핸들러 (임시 구현)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // 파일 리더를 사용하여 미리보기 URL 생성 (실제로는 서버에 업로드)
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setImageUrl('');
  };

  // 저장 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 디버깅 로그 추가
    console.log('저장 시도:', {
      cellId: cell.id,
      originalCell: cell,
      updatedValues: {
        id: cell.id,
        topic,
        memo,
        color,
        imageUrl,
        isCompleted,
      }
    });
    
    onSave({
      ...cell,
      id: cell.id,
      topic,
      memo,
      color,
      imageUrl,
      isCompleted,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 주제 입력 */}
      <InputField
        id="topic"
        label="주제"
        value={topic}
        onChange={setTopic}
        maxLength={LIMITS.TOPIC_MAX_LENGTH}
        placeholder="주제를 입력하세요"
        required
      />
      
      {/* 메모 입력 */}
      <TextArea
        label="메모"
        value={memo}
        onChange={setMemo}
        placeholder="추가 메모를 입력하세요"
        rows={4}
      />
      
      {/* 색상 선택 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          배경 색상
        </label>
        <ColorPalette
          selectedColor={color}
          onColorSelect={setColor}
        />
      </div>
      
      {/* 이미지 업로드 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          이미지
        </label>
        
        {imageUrl ? (
          <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={imageUrl}
              alt="Cell background"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
              aria-label="이미지 제거"
            >
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors"
            >
              {isUploading ? (
                <div className="text-gray-500">업로드 중...</div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">클릭하여 이미지 업로드</p>
                </>
              )}
            </label>
          </div>
        )}
      </div>
      
      {/* 완료 체크박스 */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="completed"
          checked={isCompleted}
          onChange={(e) => setIsCompleted(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="completed" className="ml-2 block text-sm text-gray-700">
          완료 표시
        </label>
      </div>
      
      {/* 액션 버튼 */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
        >
          저장
        </Button>
      </div>
    </form>
  );
};

export default CellEditorForm;
