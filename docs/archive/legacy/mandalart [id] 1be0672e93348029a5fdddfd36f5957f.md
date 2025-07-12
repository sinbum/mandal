# /cell/[id]

## 🧩 `/cell/[id]` 계층형 셀 보기 및 편집 페이지

```tsx
// /app/cell/[id]/page.tsx
<CellDetailPage>
  ├── HeaderSection
  │    ├── NavigationBar
  │    └── BreadcrumbTrail (셀 경로 탐색)
  │
  ├── MandalartGrid
  │    ├── CenterCell (현재 선택된 셀)
  │    └── ChildCell x 8 (자식 셀)
  │         ├── MandalartCellComponent (채워진 셀)
  │         └── EmptyCell (빈 셀 - 클릭하여 추가)
  │
  ├── CellDetails
  │    ├── CellInfo (현재 셀 정보)
  │    │    ├── Title
  │    │    ├── Memo
  │    │    └── CompletionStatus
  │    │
  │    └── ActionButtons
  │         ├── EditButton
  │         └── CompleteButton
  │
  └── CellEditor (모달)
       ├── TitleInput
       ├── MemoInput
       ├── ColorPicker
       ├── ImageUploader
       └── SaveButton
```

## 🧩 홈 페이지 구조 (`/`)

```tsx
// /app/page.tsx
<HomePage>
  ├── HeaderSection
  │    ├── Title
  │    ├── LogoutButton (로그인 시)
  │    └── CreateButton (새 만다라트 생성)
  │
  ├── MandalartList
  │    └── MandalartItem x N
  │         ├── Title
  │         ├── Status (완료/진행 중)
  │         ├── DeleteButton
  │         └── BackgroundImage/Color
  │
  ├── CreateMandalartDialog
  │    ├── TitleInput
  │    └── SaveButton
  │
  └── DeleteConfirmDialog
       ├── WarningMessage
       ├── CancelButton
       └── DeleteButton
```

---

## 📁 주요 컴포넌트 파일 구조

| 컴포넌트 | 설명 |
| --- | --- |
| `app/page.tsx` | 홈 페이지 (만다라트 목록) |
| `app/cell/[id]/page.tsx` | 셀 상세 페이지 |
| `app/auth/*` | 인증 관련 페이지 |
| `components/ui/*` | UI 공통 컴포넌트 |
| `components/mandalart/*` | 만다라트 관련 컴포넌트 |
| `services/mandalartService.ts` | 만다라트 API 서비스 |
| `types/mandalart.ts` | 만다라트 타입 정의 |

---

## 🔧 데이터 흐름 및 상태 관리

### 1. 셀 데이터 로드

```tsx
// app/cell/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { mandalartAPI } from '@/services/mandalartService';
import { MandalartCell } from '@/types/mandalart';

export default function CellPage({ params }: { params: { id: string } }) {
  const [cell, setCell] = useState<MandalartCell | null>(null);
  const [childCells, setChildCells] = useState<MandalartCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [path, setPath] = useState<MandalartCell[]>([]);
  
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // 1. 현재 셀 정보 로드
        const currentCell = await mandalartAPI.fetchCellById(params.id);
        if (currentCell) {
          setCell(currentCell);
          
          // 2. 자식 셀 로드
          const children = await mandalartAPI.fetchChildrenByCellId(params.id);
          setChildCells(children);
          
          // 3. 경로 구성
          const pathCells = await mandalartAPI.buildCellPath(params.id);
          setPath(pathCells);
        }
      } catch (err) {
        console.error('데이터 로드 오류:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [params.id]);
  
  // ...나머지 렌더링 로직
}
```

### 2. 셀 생성 및 편집

```tsx
// 새 셀 생성
const handleCreateCell = async (position: number) => {
  if (!cell) return;
  
  try {
    // 빈 셀 데이터 생성
    const newCellData: Partial<MandalartCell> = {
      topic: '새 셀',
      position,
      isCompleted: false
    };
    
    // 새 셀 생성 API 호출
    const newCellId = await mandalartAPI.createCell(cell.id, newCellData);
    
    // 자식 셀 목록 다시 로드
    const updatedChildren = await mandalartAPI.fetchChildrenByCellId(cell.id);
    setChildCells(updatedChildren);
    
    // 새로 생성된 셀로 이동하거나 편집
    const newCell = updatedChildren.find(c => c.id === newCellId);
    if (newCell) {
      setSelectedCell(newCell);
      setIsEditorOpen(true);
    }
  } catch (err) {
    console.error('셀 생성 오류:', err);
  }
};

// 셀 편집
const handleEditCell = async (updatedCell: MandalartCell) => {
  try {
    await mandalartAPI.updateCell(updatedCell.id, {
      topic: updatedCell.topic,
      memo: updatedCell.memo,
      color: updatedCell.color,
      imageUrl: updatedCell.imageUrl
    });
    
    // 현재 셀 또는 자식 셀 업데이트
    if (cell && cell.id === updatedCell.id) {
      setCell({...cell, ...updatedCell});
    } else {
      setChildCells(childCells.map(c => 
        c.id === updatedCell.id ? {...c, ...updatedCell} : c
      ));
    }
    
    setIsEditorOpen(false);
  } catch (err) {
    console.error('셀 업데이트 오류:', err);
  }
};
```

---

## 📊 주요 데이터 흐름도

```
1. 데이터 로드:
URL (cell ID) → useEffect → mandalartAPI → Supabase → 상태 업데이트 → 렌더링

2. 셀 생성:
사용자 액션 → handleCreateCell → mandalartAPI.createCell → Supabase 
                                                       → 상태 업데이트 → 렌더링

3. 셀 편집:
사용자 액션 → CellEditor 열기 → 편집 → handleEditCell → mandalartAPI.updateCell 
                                                      → 상태 업데이트 → 렌더링

4. 셀 완료 상태 토글:
사용자 액션 → handleToggleComplete → mandalartAPI.toggleCellCompletion
                                  → 상태 업데이트 → 렌더링