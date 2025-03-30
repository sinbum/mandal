import React, { useState } from 'react';
import ModalContainer from '@/components/ui/ModalContainer';
import { Button } from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';

interface NewMandalartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMandalart: (title: string, templateId?: string) => Promise<boolean | void>;
}

const templates = [
  { id: 'blank', name: '빈 템플릿', description: '처음부터 직접 작성하기' },
  { id: 'goal', name: '목표 설정', description: '1년 목표를 설정하는 템플릿' },
  { id: 'skill', name: '기술 습득', description: '습득하고 싶은 기술을 관리하는 템플릿' },
];

const NewMandalartModal: React.FC<NewMandalartModalProps> = ({
  isOpen,
  onClose,
  onCreateMandalart,
}) => {
  const [title, setTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      await onCreateMandalart(title, selectedTemplate !== 'blank' ? selectedTemplate : undefined);
      
      handleClose();
    } catch (err) {
      console.error('만다라트 생성 오류:', err);
      setError('만다라트 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    
    setTitle('');
    setSelectedTemplate('blank');
    setError('');
    onClose();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (error) setError('');
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={handleClose}
      title="새 만다라트 만들기"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <InputField
            id="title"
            label="제목"
            value={title}
            onChange={handleTitleChange}
            placeholder="만다라트 제목을 입력하세요"
            required
            maxLength={50}
            error={error}
            disabled={isLoading}
          />
          
          <div className="text-xs text-gray-500 mt-1">
            최대 50자까지 입력 가능합니다.
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            템플릿 선택
          </label>
          
          <div className="grid gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`
                  border rounded-lg p-3 cursor-pointer
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                  ${selectedTemplate === template.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => !isLoading && setSelectedTemplate(template.id)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={selectedTemplate === template.id}
                    onChange={() => !isLoading && setSelectedTemplate(template.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {template.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '만들기'}
          </Button>
        </div>
      </form>
    </ModalContainer>
  );
};

export default NewMandalartModal;
