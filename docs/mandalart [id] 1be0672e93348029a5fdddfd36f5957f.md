# /mandalart/[id]

## 🧩 `/mandalart/[id]` 편집 페이지 컴포넌트 트리

```tsx
// app/mandalart/[id]/page.tsx
<MandalartEditorScreen>
  ├── MobileLayout
  │    ├── HeaderBar (props: title, backButton)
  │    └── ScrollView
  │         └── MandalartGrid (81 cells)
  │               ├── MandalartCell x 81
  │               │    ├── Text (주제)
  │               │    ├── MemoPreview (옵션)
  │               │    ├── ImageThumbnail (옵션)
  │               │    └── BackgroundColorLayer
  │               └── EmptyCell (빈 셀 - 클릭하여 추가)
  │
  └── SlideUpPanel (조건부 렌더)
       └── CellEditorForm
            ├── InputField (Topic 입력, 10자 제한)
            ├── TextArea (메모 입력)
            ├── ImageUpload
            │    ├── Thumbnail
            │    └── 파일 선택 버튼
            ├── ColorPalette
            │    └── ColorCircle x N
            └── SaveButton
```

## 🧩 `/mandalart/[id]/cell/[cellId]` 상세 페이지 컴포넌트 트리

```tsx
// app/mandalart/[id]/cell/[cellId]/page.tsx
<CellDetailPage>
  ├── MobileLayout
  │    ├── HeaderBar (props: 셀 제목, backButton)
  │    └── ScrollView
  │         ├── MandalartNavigation (경로 표시)
  │         └── MandalartGrid (9 cells) - 현재 셀의 자식 셀 표시
  │               ├── MandalartCell x 9
  │               │    ├── Text (주제)
  │               │    ├── 완료 표시 아이콘
  │               │    ├── 자식 셀 표시 아이콘
  │               │    └── 편집 버튼
  │               └── EmptyCell (빈 셀 - 클릭하여 추가)
  │
  └── SlideUpPanel (조건부 렌더)
       └── CellEditorForm
            ├── InputField (Topic 입력)
            ├── TextArea (메모 입력)
            ├── ImageUpload
            ├── ColorPalette
            └── SaveButton
```

---

## 📁 관련 파일 위치

| 컴포넌트 | 위치 |
| --- | --- |
| `MandalartEditorScreen` | `/components/mandalart/MandalartEditorScreen.tsx` |
| `MobileLayout` | `/components/layout/MobileLayout.tsx` |
| `HeaderBar` | `/components/layout/HeaderBar.tsx` |
| `MandalartGrid` | `/components/mandalart/MandalartGrid.tsx` |
| `MandalartCell` | `/components/mandalart/MandalartCell.tsx` |
| `SlideUpPanel` | `/components/ui/SlideUpPanel.tsx` |
| `CellEditorForm` | `/components/mandalart/CellEditorForm.tsx` |
| `ColorPalette`, `ImageUpload`, `InputField`, `TextArea` | `/components/ui/` 내부 공통 컴포넌트 |

---

## 🔧 개선된 셀 생성/편집 로직

```tsx
// ✅ 통합된 셀 생성 및 편집 로직
// hooks/useMandalart.ts
const createCellAndEdit = useCallback(async (
  mandalartId: string, 
  position: number, 
  parentCell?: MandalartCell | null
): Promise<MandalartCell> => {
  try {
    // 부모 셀 정보 구성
    const parentData = parentCell ? {
      parentId: parentCell.id,
      parentDepth: parentCell.depth || 0
    } : {}; 

    // 새 셀 생성 및 편집 데이터 받기
    const newCell = await createNewCellAndGetEditData(
      mandalartId, 
      position, 
      parentData
    );
    
    // 부모 셀이 있으면 자식 셀 업데이트
    if (parentCell && parentCell.id) {
      // 부모 셀의 자식 목록 다시 로드
      loadChildrenForCell(parentCell.id);
    } else {
      // 루트 레벨 셀인 경우 만다라트 전체 다시 로드
      fetchMandalart(mandalartId);
    }
    
    return newCell;
  } catch (err) {
    console.error('통합 셀 생성 및 편집 실패:', err);
    throw err;
  }
}, [mandalart, fetchMandalart, loadChildrenForCell]);

// ✅ API 계층에서 통합 편집 유틸리티 함수
// api/mandalartApi.ts
export const createNewCellAndGetEditData = async (
  mandalartId: string, 
  position: number, 
  parentData: {
    parentId?: string;
    parentDepth?: number;
  } = {}
): Promise<MandalartCell> => {
  // 기본 셀 데이터 구성
  const cellData: Partial<MandalartCell> = {
    topic: '새 셀',
    parentId: parentData.parentId,
    depth: parentData.parentId ? (parentData.parentDepth !== undefined ? parentData.parentDepth + 1 : 1) : 0,
    position
  };

  // 셀 생성 API 호출
  const newCellId = await createNewCell(mandalartId, position, cellData);
    
  // 즉시 편집할 수 있는 셀 데이터 반환
  return {
    id: newCellId,
    topic: cellData.topic || '',
    memo: '',
    color: '',
    imageUrl: '',
    isCompleted: false,
    parentId: cellData.parentId,
    depth: cellData.depth || 0,
    position
  };
};
```

## 🔧 UI에서의 사용 방법 (통합됨)

```tsx
// ✅ 메인 만다라트 페이지와 셀 상세 페이지 모두 동일하게 사용
const handleCreateNewCell = async (position: number) => {
  if (!mandalart) return;
  
  try {
    // 메인 페이지인 경우
    let parentCell = null;
    
    if (isHierarchicalMandalart(mandalart)) {
      // 현재 위치에 따라 부모 셀 결정
      if (currentCell && currentCell.id !== mandalart.rootCell.id) {
        parentCell = currentCell;
      } else {
        parentCell = mandalart.rootCell;
      }
    }
    
    // 통합 셀 생성 함수 사용
    const newCell = await createCellAndEdit(id, position, parentCell);
    
    // 편집기 열기
    setSelectedCell(newCell);
    setIsEditorOpen(true);
  } catch (err) {
    console.error('새 셀 생성 실패:', err);
  }
};
```

---

## 📊 데이터 흐름 관계도

```
URL 파라미터 (ID)
      ↓
useMandalart(id) → Supabase API 호출 → API 통합 함수
     / \                                   ↓
    /   \                           createNewCellAndGetEditData
   /     \                                 ↓
메인 페이지    셀 상세 페이지            DB에 저장 + 신규 셀 정보 반환
   \     /                                 ↓
    \   /                            통합 함수에서 처리
     \ /                            (UI 업데이트, 부모 셀 자식 갱신)
handleCreateNewCell                        ↓
      ↓                            setSelectedCell & setIsEditorOpen
<SlideUpPanel>                             ↓
      ↓                              <CellEditorForm>
 셀 편집 저장                              ↓
      ↓                              onSave 호출
  API 호출                                 ↓
      ↓                              updateCell
  UI 자동 갱신
```

---

## 🔄 API 연동 코드 예시

```tsx
// 셀 업데이트 API
const updateCell = useCallback(async (cellId: string, updatedCell: MandalartCell) => {
  try {
    const supabase = createClient();
    
    // Supabase API로 셀 업데이트
    const { error } = await supabase
      .from('mandalart_cells')
      .update({
        topic: updatedCell.topic,
        memo: updatedCell.memo,
        color: updatedCell.color,
        image_url: updatedCell.imageUrl,
        is_completed: updatedCell.isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', cellId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // UI 상태 업데이트
    setMandalart(prev => {
      // UI 상태 갱신 로직
    });
  } catch (err) {
    console.error('셀 업데이트 실패:', err);
    setError('셀 업데이트에 실패했습니다.');
  }
}, [mandalart]);
```

---

## 📱 UI 주요 기능

1. **셀 표시**: 81개 셀을 9x9 격자로 표시 (각 셀은 클릭 가능)
2. **셀 편집**: 슬라이드업 패널에서 주제, 메모, 색상 편집
3. **완료 상태 관리**: 셀 완료 표시 기능
4. **새 셀 생성**: 빈 셀 클릭 시 새 셀 생성 기능 (✅ 통합 로직으로 개선됨)
5. **계층적 구조 관리**: 셀 내부에 하위 셀 구성 가능
6. **헤더 네비게이션**: 뒤로가기, 타이틀 표시
7. **반응형 레이아웃**: 다양한 화면 크기에 맞게 조정
8. **경로 탐색**: 셀 계층 구조를 따라 드릴다운 및 상위 이동 가능

### 🔹 주요 API 기능 (useMandalart.ts에 구현)

- `fetchMandalart`: 만다라트 전체 데이터 로드
- `fetchMandalartList`: 사용자의 만다라트 목록 조회
- `updateCell`: 개별 셀 데이터 업데이트
- `createMandalart`: 새 만다라트 생성
- `createCell`: 개별 셀 생성 (기본 함수)
- `createCellAndEdit`: 셀 생성 및 편집용 데이터 즉시 반환 (✅ 추가됨)
- `loadChildrenForCell`: 특정 셀의 하위 셀 로드
- `toggleCellCompletion`: 셀 완료 상태 토글
- `deleteMandalart`: 만다라트 삭제

### 🔹 데이터 변환 유틸리티

- `mapPositionToBlockAndCell`: 포지션(0-80)을 블록/셀 인덱스로 변환
- `mapBlockAndCellToPosition`: 블록/셀 인덱스를 포지션으로 변환
- `convertDbCellsToMandalart`: DB 데이터를 프론트엔드 모델로 변환
- `findCellInHierarchy`: 계층 구조에서 특정 셀 찾기
- `updateCellChildrenInHierarchy`: 계층 구조에서 자식 셀 업데이트
- `createNewCellAndGetEditData`: 셀 생성 후 즉시 편집 가능한 데이터 반환 (✅ 추가됨)