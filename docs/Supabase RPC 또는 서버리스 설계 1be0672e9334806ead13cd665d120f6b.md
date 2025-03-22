# Supabase RPC 또는 서버리스 설계

Supabase 기반에서 **만다라트 생성/편집 등 주요 기능을 처리할 RPC 또는 Edge Function(Serverless Function)** 설계를 제안드릴게요.

Supabase에서 가능한 두 가지 방식은 다음과 같습니다:

| 방식 | 설명 | 장점 | 예시 사용 |
| --- | --- | --- | --- |
| 🔸 RPC (PostgreSQL 함수) | Supabase DB 내부에 직접 SQL 함수 생성 | 빠르고 DB 연산 최적화 | 복수 row insert, bulk update 등 |
| 🔹 Edge Function (서버리스 함수) | Supabase Functions (Node.js/TypeScript 기반) | 복잡한 로직, 외부 API 호출 가능 | 이미지 처리, 인증 기반 API |

---

## ✅ 우선 설계 대상

아래 두 가지는 성능/일관성 모두 중요한 로직이라 RPC로 적합합니다:

1. **`create_mandalart_with_cells()`**
2. **`duplicate_mandalart_from_template()`**

---

## 🔸 1. `create_mandalart_with_cells()` — 빈 만다라트 생성 RPC

### 목적:

- 만다라트 1건 생성 + 81칸(position 0~80) 초기화

### 입력:

```
ts
복사편집
{
  user_id: UUID,
  title: string
}

```

### 출력:

- 생성된 `mandalart_id`

### SQL 예시:

```sql
sql
복사편집
CREATE OR REPLACE FUNCTION create_mandalart_with_cells(
  _user_id UUID,
  _title TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO mandalarts (id, user_id, title)
  VALUES (new_id, _user_id, _title);

  INSERT INTO mandalart_cells (id, mandalart_id, position)
  SELECT gen_random_uuid(), new_id, generate_series(0, 80);

  RETURN new_id;
END;
$$;

```

---

## 🔸 2. `duplicate_mandalart_from_template()` — 템플릿 복제 RPC

### 목적:

- `mandalarts`에서 is_template = true인 문서를 선택하여, 복사본 생성

### 입력:

```
ts
복사편집
{
  user_id: UUID,
  template_id: UUID
}

```

### 출력:

- 새로 생성된 `mandalart_id`

### SQL 예시:

```sql
sql
복사편집
CREATE OR REPLACE FUNCTION duplicate_mandalart_from_template(
  _user_id UUID,
  _template_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_id UUID := gen_random_uuid();
BEGIN
  -- 템플릿 문서 복사
  INSERT INTO mandalarts (id, user_id, title, is_template)
  SELECT new_id, _user_id, title, FALSE
  FROM mandalarts
  WHERE id = _template_id;

  -- 셀 내용 복사
  INSERT INTO mandalart_cells (id, mandalart_id, position, topic, memo, image_url, color)
  SELECT gen_random_uuid(), new_id, position, topic, memo, image_url, color
  FROM mandalart_cells
  WHERE mandalart_id = _template_id;

  RETURN new_id;
END;
$$;

```

---

## 🔹 서버리스 함수(Edge Function) 사용 예시

### 적합 시나리오:

- **이미지 리사이징/처리**
- **협업 초대 등 인증 정보 포함 요청**
- 외부 API 연동 (예: 캘린더, 알림, GPT 등)

### 예시 함수: `inviteUserToMandalart.ts`

```
ts
복사편집
// supabase/functions/inviteUserToMandalart.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { mandalartId, inviteEmail } = await req.json()

  // 1. 유저 이메일 조회
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', inviteEmail)
    .single()

  // 2. 공유 테이블에 권한 추가 등 처리...

  return new Response(JSON.stringify({ success: true }))
})

```

---

## 📌 추천 설계 기준

| 항목 | RPC | Edge Function |
| --- | --- | --- |
| 81칸 bulk 생성 | ✅ 매우 적합 | ❌ |
| 템플릿 복사 | ✅ 적합 | ❌ |
| 사용자 인증/역할 검사 | ❌ 어려움 | ✅ |
| 외부 API 호출 | ❌ 불가 | ✅ |
| 파일 처리 | ❌ | ✅ |