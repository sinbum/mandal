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
  toggleCellCompletion // 완료 상태 토글
} = useMandalart(mandalartId); // URL 파라미터에서 ID 가져옴

// 셀 클릭 핸들러
const handleCellClick = (cellId: string) => {
  // 현재 선택된 셀 찾기
  const selectedCell = findCellById(cellId, mandalart);
  setSelectedCell(selectedCell);
  setIsEditorOpen(true);
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
<MandalartCell onClick={handleCellClick}>
      ↓
setSelectedCell + 슬라이드업 열기
      ↓
<CellEditorForm onSave={handleSaveCell}>
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
```

---

## 📱 UI 주요 기능

1. **셀 표시**: 81개 셀을 9x9 격자로 표시 (각 셀은 클릭 가능)
2. **셀 편집**: 슬라이드업 패널에서 주제, 메모, 색상 편집
3. **완료 상태 관리**: 셀 완료 표시 기능
4. **헤더 네비게이션**: 뒤로가기, 타이틀 표시
5. **반응형 레이아웃**: 다양한 화면 크기에 맞게 조정