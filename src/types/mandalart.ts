export interface MandalartCell {
  id: string;
  topic: string;
  memo?: string;
  color?: string;
  imageUrl?: string;
  isCompleted?: boolean;
  parentId?: string | null;
  depth: number;
  position: number;
  children?: MandalartCell[];
}

export interface MandalartCellWithChildren extends MandalartCell {
  children: MandalartCell[];
}

export interface MandalartBlock {
  id: string;
  centerCell: MandalartCell;
  surroundingCells: MandalartCell[];
}

export interface Mandalart {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  rootCell?: MandalartCellWithChildren;
  centerBlock?: MandalartBlock;
  surroundingBlocks?: MandalartBlock[];
}

export interface MandalartCellProps {
  cell: MandalartCell;
  isCenter?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  className?: string;
  hasChildren?: boolean;
}

export interface MandalartGridProps {
  mandalart: Mandalart;
  currentCell?: MandalartCellWithChildren;
  onCellClick: (cellId: string) => void;
  onCellEdit?: (cellId: string) => void;
  onNavigateBack?: () => void;
  className?: string;
  isExpanded?: boolean;
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
