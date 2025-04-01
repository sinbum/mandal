# Supabase DB 테이블 설계

## 🧾 Supabase DB 테이블 설계

### 1. 🧑‍💼 `users` (Supabase 기본 제공)

> Supabase의 인증 기능을 사용하면 자동 생성됩니다.
> 

```sql
-- Supabase 인증 시스템을 통해 관리
id UUID PRIMARY KEY
email TEXT
created_at TIMESTAMP
```

---

### 2. 📋 `mandalarts` — 만다라트 전체 문서

```sql
CREATE TABLE mandalarts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

🔹 **인덱스 추천**

```sql
CREATE INDEX idx_user_id ON mandalarts(user_id);
```

---

### 3. 🟦 `mandalart_cells` — 계층형 셀 데이터

```sql
CREATE TABLE mandalart_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandalart_id UUID REFERENCES mandalarts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES mandalart_cells(id) ON DELETE CASCADE,
  topic TEXT,
  memo TEXT,
  image_url TEXT,
  color TEXT,
  position INT NOT NULL CHECK (position >= 0 AND position <= 8),
  depth INT NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

🔹 **인덱스 및 제약조건**

```sql
-- 부모 셀 ID 기준 인덱스
CREATE INDEX idx_parent_id ON mandalart_cells(parent_id);

-- 만다라트 ID 기준 인덱스
CREATE INDEX idx_mandalart_id ON mandalart_cells(mandalart_id);

-- 같은 부모 내에서 포지션 중복 방지
CREATE UNIQUE INDEX idx_unique_position_per_parent ON mandalart_cells(parent_id, position)
WHERE parent_id IS NOT NULL;
```

---

## 🧠 데이터 구조 설명

### 셀 계층 구조
- 만다라트는 재귀적인 3x3 그리드 구조로 설계
- 각 셀은 최대 9개의 자식 셀을 가질 수 있음 (position 0-8)
- `depth`와 `parent_id`로 계층 관계 표현

### 셀 속성
- `topic`: 셀의 제목 또는 주제
- `memo`: 추가 메모나 설명
- `color`: 셀 배경색 (HEX 코드)
- `image_url`: 셀 이미지 URL
- `is_completed`: 완료 여부

---

## ✅ 데이터 흐름

1. **만다라트 생성:**
   - `mandalarts` 테이블에 새 문서 추가
   - 루트 셀(depth=0) 생성
   - 필요시 첫 레벨 자식 셀(depth=1) 생성

2. **셀 탐색 및 편집:**
   - 셀 ID로 특정 셀 조회
   - `parent_id`로 상위 셀 조회
   - `parent_id`와 `depth`로 자식 셀 조회
   - 셀 속성 업데이트

3. **만다라트 삭제:**
   - 만다라트 ID 기준으로 삭제 (CASCADE로 모든 관련 셀 함께 삭제)

---

## 📌 보안 정책 (Row-Level Security)

Supabase에서는 아래 RLS 정책 설정이 필요합니다:

### `mandalarts` RLS 정책:

```sql
-- 사용자는 본인의 문서만 접근 가능
CREATE POLICY "Allow user access to own mandalarts"
  ON mandalarts
  FOR ALL
  USING (user_id = auth.uid());
```

### `mandalart_cells` RLS 정책:

```sql
-- 사용자는 자신의 만다라트에 속한 셀만 접근 가능
CREATE POLICY "Allow user access to own cells"
  ON mandalart_cells
  FOR ALL
  USING (
    mandalart_id IN (
      SELECT id FROM mandalarts WHERE user_id = auth.uid()
    )
  );
```