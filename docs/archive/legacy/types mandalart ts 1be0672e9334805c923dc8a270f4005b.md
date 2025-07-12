# /types/mandalart.ts

## 📁 `/types/mandalart.ts`

```ts
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
```

---

```ts
// 기존 타입과의 호환성을 위한 별칭
export type MandalartCellWithChildren = MandalartCell;
export type MandalartHierarchical = Mandalart;
```

---

## 🔧 셀 구조 설명

만다라트는 계층형 구조로 설계되어 있습니다:
- `depth`: 깊이 수준 (0: 루트 셀, 1: 1단계 자식 셀, ...)
- `position`: 동일 부모 내 위치 (0~8)
- `parentId`: 부모 셀 ID (루트 셀은 null)
- `children`: 자식 셀 배열 (UI 표시용)

---

## 📌 컴포넌트 Props 타입

```ts
// 만다라트 셀 컴포넌트 Props
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

// 만다라트 그리드 컴포넌트 Props
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

// 만다라트 카드 컴포넌트 Props
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

// 셀 에디터 컴포넌트 Props
export interface CellEditorFormProps {
  cell: MandalartCell;
  onSave: (updatedCell: MandalartCell) => void;
  onCancel: () => void;
}

// 새 만다라트 모달 Props
export interface NewMandalartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMandalart: (title: string, templateId?: string) => void;
  templates?: Array<{id: string, title: string}>;
}

// 만다라트 네비게이션 Props
export interface MandalartNavigationProps {
  path: MandalartCell[];
  onNavigate: (cellId: string) => void;
}
```

## 🔄 네비게이션 관련 타입

```ts
// 네비게이션을 위한 셀 타입
export interface MandalartCell {
  id: string;
  position: number;
  topic?: string;
  parentId?: string;
}

// 자식 셀 정보를 포함한 확장 타입
export interface MandalartCellWithChildren extends MandalartCell {
  children?: MandalartCell[];
}
```
