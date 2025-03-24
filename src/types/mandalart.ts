export interface MandalartCell {
  id: string;
  topic: string;
  memo?: string;
  color?: string;
  imageUrl?: string;
  isCompleted?: boolean;
  depth: number;
  position: number;
  parentId?: string;
}

export interface MandalartCellWithChildren extends MandalartCell {
  children: MandalartCell[];
}

export interface MandalartHierarchical {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  rootCell: MandalartCellWithChildren;
}

export type Mandalart = MandalartHierarchical;

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
