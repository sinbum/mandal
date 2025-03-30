import React, { useState, ChangeEvent } from 'react';
import { CellEditorFormProps } from '@/types/mandalart';
import { LIMITS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/TextArea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../ui/card';
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
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
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
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader className="mb-4">
          <CardTitle>셀 편집</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 주제 입력 */}
          <div className="space-y-2">
            <Label htmlFor="topic">주제</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
              maxLength={LIMITS.TOPIC_MAX_LENGTH}
              placeholder="주제를 입력하세요"
              required
            />
          </div>
          
          {/* 메모 입력 */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMemo(e.target.value)}
              placeholder="추가 메모를 입력하세요"
              rows={4}
            />
          </div>
          
          {/* 색상 선택 */}
          <div className="space-y-2">
            <Label>배경 색상</Label>
            <ColorPalette
              selectedColor={color}
              onColorSelect={setColor}
            />
          </div>
          
          {/* 이미지 업로드 */}
          {/* <div className="space-y-2">
            <Label>이미지</Label>
            {imageUrl ? (
              <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Cell background"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
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
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                >
                  {isUploading ? (
                    <div className="text-muted-foreground">업로드 중...</div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-muted-foreground">클릭하여 이미지 업로드</p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div> */}
          
          {/* 완료 체크박스 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={isCompleted}
              onCheckedChange={(checked: boolean) => setIsCompleted(checked)}
            />
            <Label htmlFor="completed">완료 표시</Label>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            취소
          </Button>
          <Button
            type="submit"
          >
            저장
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CellEditorForm;
