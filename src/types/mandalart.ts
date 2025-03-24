/**
 * 만다라트 셀 정의
 */
export interface MandalartCell {
  id: string;
  topic: string;
  memo?: string;
  color?: string;
  imageUrl?: string;
  isCompleted: boolean;
  parentId?: string | null;
  depth: number;
  position: number;
  mandalartId?: string; // 셀이 속한 만다라트 ID
  children?: MandalartCell[]; // 자식 셀 목록 (UI를 위해 확장)
}

/**
 * 만다라트 정의
 */
export interface Mandalart {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  rootCell: MandalartCell;
}

// 기존 타입과의 호환성을 위한 별칭
export type MandalartCellWithChildren = MandalartCell;
export type MandalartHierarchical = Mandalart;

export interface MandalartCellProps {
  cell: MandalartCell;
  isCenter?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onToggleComplete?: () => void;
  className?: string;
  hasChildren?: boolean;
  isEmpty?: boolean;
}

export interface MandalartGridProps {
  mandalart: Mandalart;
  currentCell?: MandalartCellWithChildren;
  onCellClick: (cellId: string) => void;
  onCellEdit?: (cellId: string) => void;
  onCellToggleComplete?: (cellId: string) => void;
  onNavigateBack?: () => void;
  className?: string;
  depth?: number;
}

export interface MandalartCardProps {
  mandalart: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  };
  onClick: () => void;
  className?: string;
}

export interface CellEditorFormProps {
  cell: MandalartCell;
  onSave: (updatedCell: MandalartCell) => void;
  onCancel: () => void;
}

export interface NewMandalartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMandalart: (title: string, templateId?: string) => void;
  templates?: Array<{id: string, title: string}>;
}

export interface MandalartNavigationProps {
  path: MandalartCell[];
  onNavigate: (cellId: string) => void;
}
