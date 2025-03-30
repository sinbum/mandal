# /types/mandalart.ts

## 📁 `/types/mandalart.ts`

```
ts
복사편집
// 하나의 만다라트 문서 (9x9 전체 구조)
export interface MandalartData {
  id: string;                   // 고유 ID
  userId: string;               // 작성자 ID
  title: string;                // 만다라트 제목
  createdAt: string;           // 생성일 (ISO string)
  updatedAt: string;           // 마지막 수정일
  cells: MandalartCellData[];  // 81칸의 셀 데이터 배열
  isTemplate?: boolean;        // 템플릿 여부 (선택)
}

```

---

```
ts
복사편집
// 9x9 셀 중 하나의 데이터
export interface MandalartCellData {
  id: string;                   // 셀 고유 ID
  mandalartId: string;          // 소속된 만다라트 ID
  position: number;             // 0~80 (격자 위치 인덱스)
  topic?: string;               // 주제 텍스트 (최대 10자)
  memo?: string;                // 메모 텍스트 (제한 없음)
  imageUrl?: string;            // 첨부 이미지 URL (옵션)
  color?: string;               // HEX or 프리셋 이름
  createdAt: string;
  updatedAt: string;
}

```

---

```
ts
복사편집
// (선택) 템플릿용 기본 구조 정의
export interface MandalartTemplate {
  id: string;
  title: string;
  previewImageUrl?: string;
  defaultCells: Partial<MandalartCellData>[];
}

```

---

## 🔧 position 필드 기준 설명

- 전체 81칸을 **왼쪽 상단부터 오른쪽 하단까지** 0~80 인덱스로 순차 부여
- `position: 40` → 중앙 칸
- 중심 블록 / 주변 블록 등을 계산하거나 연동 로직 설계 시 활용

---

## 🛠️ 관련 유저 타입 (예: `/types/user.ts`)

```
ts
복사편집
export interface User {
  id: string;
  email: string;
  name?: string;
  profileImageUrl?: string;
  createdAt: string;
}

```

---

## 📌 다음 확장 고려사항

| 항목 | 고려 포인트 |
| --- | --- |
| `historyLog` | 셀 단위 변경 이력 관리 (추후 도입 가능) |
| `sharedUsers` | 협업 시 권한 관리 (장기 로드맵 항목) |
| `tags` | 템플릿 또는 문서 분류 시 사용 가능 |

## 🎯 컴포넌트 Props 타입

```ts
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

// 새 만다라트 생성 모달 Props
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
