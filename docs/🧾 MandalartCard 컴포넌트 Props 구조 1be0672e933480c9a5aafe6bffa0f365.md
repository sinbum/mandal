# 🧾 MandalartCard 컴포넌트 Props 구조

## 🧾 `MandalartCard` 컴포넌트 Props 구조

```tsx
type MandalartCardProps = {
  id: string;                            // 만다라트 고유 ID (페이지 이동용)
  title: string;                         // 만다라트 제목
  createdAt: string;                     // 생성일 (ISO string 또는 Date)
  updatedAt: string;                     // 마지막 수정일
  onClick: (id: string) => void;         // 카드 클릭 시 호출될 콜백
  colorTag?: string;                     // (선택) 카드 테두리 색상 or 태그 색상
  thumbnailUrl?: string;                 // (선택) 대표 이미지 썸네일
};

```

---

## 🔸 예시 사용

```tsx
tsx
복사편집
<MandalartCard
  id="abc123"
  title="퍼스널 브랜딩 목표"
  createdAt="2025-03-20"
  updatedAt="2025-03-22"
  onClick={(id) => router.push(`/mandalart/${id}`)}
  colorTag="#A78BFA"
  thumbnailUrl="/thumbs/branding.png"
/>

```

---

## 🎨 UI 요소 구성 예시

| 요소 | 설명 |
| --- | --- |
| 제목 (`title`) | 중앙 정렬, 1~2줄 표시 |
| 날짜 (`createdAt`, `updatedAt`) | 하단 또는 오른쪽 구석에 작게 |
| 썸네일 (`thumbnailUrl`) | 왼쪽 or 상단 썸네일 이미지 (옵션) |
| 색상 태그 (`colorTag`) | 카드 테두리 or 상단 색상 라벨 |
| 클릭 영역 (`onClick`) | 전체 카드 영역 Touchable 처리 |

---

## 🛠️ 추후 확장 고려 Props

| 필드 | 설명 |
| --- | --- |
| `sharedWith?: number` | 공유 인원 수 표시 |
| `isTemplate?: boolean` | 템플릿 여부 (템플릿 리스트에서도 재사용 가능) |
| `tagList?: string[]` | 태그 표시용 (예: #자기계발, #건강 등) |