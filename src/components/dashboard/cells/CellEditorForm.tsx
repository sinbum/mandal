import React, { useState, ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
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
} from '../../ui/card';
import ColorPalette from '../../ui/ColorPalette';

const CellEditorForm: React.FC<CellEditorFormProps> = ({
  cell,
  onSave,
  onCancel,
}) => {
  const [topic, setTopic] = useState(cell.topic || '');
  const [memo, setMemo] = useState(cell.memo || '');
  const [color, setColor] = useState(cell.color || '');
  const [imageUrl] = useState(cell.imageUrl || '');
  const [isCompleted, setIsCompleted] = useState(cell.isCompleted || false);

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

  const modalContent = (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-black/50 animate-in fade-in duration-200"
        onClick={onCancel}
      />
      {/* 모달 컨텐츠 */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <Card className="relative w-full max-w-lg bg-white shadow-2xl rounded-2xl border-gray-200 my-8 pointer-events-auto transform transition-all duration-300 ease-in-out scale-95 animate-in fade-in-90 slide-in-from-bottom-10">
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
      </div>
    </>
  );

  // Portal을 사용하여 body에 직접 렌더링
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default CellEditorForm;
