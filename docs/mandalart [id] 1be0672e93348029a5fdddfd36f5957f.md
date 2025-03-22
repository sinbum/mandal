# /mandalart/[id]

## 🧩 `/mandalart/[id]` 편집 페이지 컴포넌트 트리

```tsx
tsx
복사편집
// pages/mandalart/[id].tsx
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

## 📁 관련 파일 위치 예시

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

## 🔧 상태 관리 흐름 (예시)

```

// useMandalart.ts (커스텀 훅 내부)
const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
const [mandalartData, setMandalartData] = useState<MandalartData>();
const openCellEditor = (id: string) => setSelectedCellId(id);

// 각 MandalartCell onClick 시 openCellEditor 호출 → SlideUpPanel 활성화

```