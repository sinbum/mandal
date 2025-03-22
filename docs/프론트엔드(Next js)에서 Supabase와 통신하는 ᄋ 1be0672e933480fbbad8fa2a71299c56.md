# 프론트엔드(Next.js)에서 Supabase와 통신하는 예시 코드

## 기본 설정 (supabase client)

먼저 프로젝트에 Supabase 클라이언트를 세팅해야 합니다:

```

// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

```

---

## ✅ 1. `create_mandalart_with_cells` RPC 호출 예시

```

import { supabase } from '@/lib/supabaseClient'

export const createNewMandalart = async (title: string, userId: string) => {
  const { data, error } = await supabase
    .rpc('create_mandalart_with_cells', {
      _title: title,
      _user_id: userId
    })

  if (error) throw error
  return data as string // 반환된 mandalart_id
}

```

### 🔸 사용 예시

```

const handleCreate = async () => {
  try {
    const mandalartId = await createNewMandalart('새 목표 설정', user.id)
    router.push(`/mandalart/${mandalartId}`)
  } catch (e) {
    toast.error('만다라트 생성 실패!')
  }
}

```

---

## ✅ 2. `duplicate_mandalart_from_template` RPC 호출 예시

```

export const duplicateFromTemplate = async (templateId: string, userId: string) => {
  const { data, error } = await supabase
    .rpc('duplicate_mandalart_from_template', {
      _template_id: templateId,
      _user_id: userId
    })

  if (error) throw error
  return data as string // 새로 복제된 mandalart_id
}

```

---

## ✅ 3. 만다라트 리스트 불러오기 (`mandalarts`)

```

export const fetchUserMandalarts = async (userId: string) => {
  const { data, error } = await supabase
    .from('mandalarts')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

```

---

## ✅ 4. 특정 만다라트의 셀 81개 불러오기

```

export const fetchMandalartCells = async (mandalartId: string) => {
  const { data, error } = await supabase
    .from('mandalart_cells')
    .select('*')
    .eq('mandalart_id', mandalartId)
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

```

---

## ✅ 5. 셀 하나 업데이트하기 (topic, memo 등)

```

export const updateCell = async (cellId: string, payload: Partial<MandalartCellData>) => {
  const { error } = await supabase
    .from('mandalart_cells')
    .update({
      ...payload,
      updated_at: new Date().toISOString()
    })
    .eq('id', cellId)

  if (error) throw error
}

```

---

## 📌 인증 사용자 ID 가져오기 (`auth.uid()`)

```

const user = supabase.auth.getUser()
// 또는
const { data: { user } } = await supabase.auth.getUser()

```

---

## 🧠 프론트 + RPC 전략 정리

| 작업 | 방식 | 설명 |
| --- | --- | --- |
| 새 만다라트 생성 | RPC | `create_mandalart_with_cells` |
| 템플릿 복사 | RPC | `duplicate_mandalart_from_template` |
| 리스트/셀 조회 | `.from()` | 일반 SELECT |
| 셀 수정 | `.update()` | 하나씩 수정 |
| 셀 여러 개 저장 | 추후 bulk update / RPC 고려 | 위치 변경, 일괄 저장 등에서 유용 |