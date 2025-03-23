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

## 🔧 상태 관리 흐름

```tsx
// hooks/useMandalart.ts 훅 활용
const {
  mandalart,         // 전체 만다라트 데이터
  isLoading,         // 로딩 상태
  error,             // 에러 상태
  fetchMandalart,    // 만다라트 데이터 조회
  updateCell,        // 셀 업데이트
  createCell,        // 셀 생성 (추가됨)
  toggleCellCompletion // 완료 상태 토글
} = useMandalart(mandalartId); // URL 파라미터에서 ID 가져옴

// 셀 클릭 핸들러
const handleCellClick = (cellId: string) => {
  // 빈 셀인 경우 새 셀 생성
  if (cellId.startsWith('empty-')) {
    const positionNumber = parseInt(cellId.split('-')[1], 10);
    handleCreateNewCell(positionNumber);
    return;
  }
  
  // 일반 셀인 경우 하위 셀로 이동 또는 편집
  const selectedCell = findCellById(cellId, mandalart);
  setSelectedCell(selectedCell);
  setIsEditorOpen(true);
};

// 새 셀 생성 핸들러
const handleCreateNewCell = async (position: number) => {
  if (!currentCell) return;
  
  const newCellId = await createCell(id, position, {
    topic: '새 셀',
    parentId: currentCell.id,
    depth: (currentCell.depth || 0) + 1,
    position: position
  });
  
  // 자식 셀 다시 로드
  loadChildrenForCell(currentCell.id);
};

// 셀 저장 핸들러
const handleSaveCell = (updatedCell: MandalartCell) => {
  updateCell(updatedCell.id, updatedCell);
  setIsEditorOpen(false);
};
```

---

## 📊 데이터 흐름 관계도

```
URL 파라미터 (ID)
      ↓
useMandalart(id) → Supabase API 호출
      ↓
mandalart 데이터
      ↓
<MandalartGrid>
      ↓
<MandalartCell onClick={handleCellClick}> | <EmptyCell onClick={handleCreateNewCell}>
      ↓                                     ↓
setSelectedCell + 슬라이드업 열기          새 셀 생성 API 호출
      ↓                                     ↓
<CellEditorForm onSave={handleSaveCell}>    자식 셀 다시 로드
      ↓
updateCell(id, data) → Supabase API 업데이트
      ↓
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

// 새 셀 생성 API
const createCell = useCallback(async (mandalartId: string, position: number, cellData: Partial<MandalartCell>): Promise<string> => {
  try {
    const supabase = createClient();
    
    // 셀 데이터 삽입
    const { data, error } = await supabase
      .from('mandalart_cells')
      .insert({
        mandalart_id: mandalartId,
        position: position,
        topic: cellData.topic || '',
        memo: cellData.memo,
        color: cellData.color,
        image_url: cellData.imageUrl,
        is_completed: cellData.isCompleted || false,
        parent_id: cellData.parentId || null, // 부모 ID 설정
        depth: cellData.depth || 0, // 깊이 설정
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // UI 상태 업데이트 (자식 셀 추가)
    if (cellData.parentId) {
      // 부모 셀에 자식 셀 추가하는 로직
    }
    
    return data.id;
  } catch (err) {
    console.error('셀 생성 실패:', err);
    throw err;
  }
}, [mandalart]);
```

---

## 📱 UI 주요 기능

1. **셀 표시**: 81개 셀을 9x9 격자로 표시 (각 셀은 클릭 가능)
2. **셀 편집**: 슬라이드업 패널에서 주제, 메모, 색상 편집
3. **완료 상태 관리**: 셀 완료 표시 기능
4. **새 셀 생성**: 빈 셀 클릭 시 새 셀 생성 기능 (추가됨)
5. **계층적 구조 관리**: 셀 내부에 하위 셀 구성 가능 (추가됨)
6. **헤더 네비게이션**: 뒤로가기, 타이틀 표시
7. **반응형 레이아웃**: 다양한 화면 크기에 맞게 조정
```

### 🔹 주요 API 기능 (useMandalart.ts에 구현)

- `fetchMandalart`: 만다라트 전체 데이터 로드
- `fetchMandalartList`: 사용자의 만다라트 목록 조회
- `updateCell`: 개별 셀 데이터 업데이트
- `createMandalart`: 새 만다라트 생성
- `createCell`: 개별 셀 생성 (계층형 구조 지원)
- `loadChildrenForCell`: 특정 셀의 하위 셀 로드 (추가됨)
- `toggleCellCompletion`: 셀 완료 상태 토글
- `deleteMandalart`: 만다라트 삭제

### 🔹 데이터 변환 유틸리티

- `mapPositionToBlockAndCell`: 포지션(0-80)을 블록/셀 인덱스로 변환
- `mapBlockAndCellToPosition`: 블록/셀 인덱스를 포지션으로 변환
- `convertDbCellsToMandalart`: DB 데이터를 프론트엔드 모델로 변환
- `findCellInHierarchy`: 계층 구조에서 특정 셀 찾기 (추가됨)
- `updateCellChildrenInHierarchy`: 계층 구조에서 자식 셀 업데이트 (추가됨)