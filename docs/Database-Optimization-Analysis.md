# 데이터베이스 최적화 분석 및 제안

## 🔍 현재 상황 분석

### 1. 브레드크럼 네비게이션 스켈레톤 추가 ✅
- **문제**: 셀 이동 시 네비게이션 영역 레이아웃 시프트 발생
- **해결**: `BreadcrumbSkeleton` 컴포넌트 추가 및 로딩 상태 연동
- **결과**: 네비게이션 로딩 중에도 일관된 레이아웃 유지

### 2. 현재 데이터베이스 구조 분석

#### 테이블 구조
```sql
mandalarts
├── id (UUID)
├── user_id (UUID) 
├── title (TEXT)
├── created_at, updated_at

mandalart_cells
├── id (UUID)
├── mandalart_id (UUID) -> mandalarts.id
├── parent_id (UUID) -> mandalart_cells.id
├── topic, memo, image_url, color
├── position (INT 0-8)
├── depth (INT)
├── is_completed (BOOLEAN)
├── created_at, updated_at
```

#### 현재 인덱스
```sql
-- 기존 인덱스
idx_parent_id ON mandalart_cells(parent_id)
idx_mandalart_id ON mandalart_cells(mandalart_id)
idx_unique_position_per_parent ON mandalart_cells(parent_id, position)
```

## 🚀 데이터베이스 최적화 제안

### 1. 추가 인덱스 제안

#### A. 복합 인덱스 최적화
```sql
-- 셀 조회 쿼리 최적화 (parent_id + position + depth)
CREATE INDEX idx_cell_hierarchy ON mandalart_cells(parent_id, depth, position);

-- 사용자별 루트 셀 조회 최적화
CREATE INDEX idx_user_root_cells ON mandalart_cells(mandalart_id, parent_id, created_at) 
WHERE parent_id IS NULL;

-- 완료율 계산 최적화
CREATE INDEX idx_completion_status ON mandalart_cells(mandalart_id, is_completed);
```

### 2. 쿼리 최적화 방안

#### A. 현재 문제점
```typescript
// 현재: N+1 쿼리 문제
async fetchUserCells(): Promise<MandalartCell[]> {
  // 1. 만다라트 조회
  const mandalarts = await supabase.from('mandalarts')...
  
  // 2. 각 만다라트마다 루트 셀 조회  
  const rootCells = await supabase.from('mandalart_cells')...
  
  // 3. 각 루트 셀마다 자식 조회 (N+1 문제)
  await Promise.all(rootCells.map(async (cell) => {
    const children = await this.fetchChildrenByCellId(cell.id);
    const progressInfo = await this.calculateMandalartProgress(cell.mandalart_id);
  }));
}
```

#### B. 최적화된 접근 방법

##### 방법 1: 단일 쿼리로 계층 데이터 조회
```sql
-- PostgreSQL CTE를 사용한 계층 조회
WITH RECURSIVE cell_hierarchy AS (
  -- 루트 셀들
  SELECT c.*, 0 as level
  FROM mandalart_cells c
  JOIN mandalarts m ON c.mandalart_id = m.id
  WHERE m.user_id = $1 AND c.parent_id IS NULL
  
  UNION ALL
  
  -- 자식 셀들 (최대 2레벨까지)
  SELECT c.*, ch.level + 1
  FROM mandalart_cells c
  JOIN cell_hierarchy ch ON c.parent_id = ch.id
  WHERE ch.level < 2
)
SELECT * FROM cell_hierarchy
ORDER BY mandalart_id, level, position;
```

##### 방법 2: Supabase RPC 함수 활용
```sql
CREATE OR REPLACE FUNCTION get_user_mandalart_tree(user_uuid UUID)
RETURNS TABLE(
  cell_id UUID,
  mandalart_id UUID,
  parent_id UUID,
  topic TEXT,
  memo TEXT,
  color TEXT,
  position INT,
  depth INT,
  is_completed BOOLEAN,
  level INT,
  total_cells BIGINT,
  completed_cells BIGINT,
  progress_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE cell_tree AS (
    -- 루트 셀들과 진행률 정보
    SELECT 
      c.id as cell_id,
      c.mandalart_id,
      c.parent_id,
      c.topic,
      c.memo,
      c.color,
      c.position,
      c.depth,
      c.is_completed,
      0 as level,
      (SELECT COUNT(*) FROM mandalart_cells WHERE mandalart_id = c.mandalart_id) as total_cells,
      (SELECT COUNT(*) FROM mandalart_cells WHERE mandalart_id = c.mandalart_id AND is_completed = true) as completed_cells,
      ROUND(
        (SELECT COUNT(*) FROM mandalart_cells WHERE mandalart_id = c.mandalart_id AND is_completed = true) * 100.0 /
        NULLIF((SELECT COUNT(*) FROM mandalart_cells WHERE mandalart_id = c.mandalart_id), 0),
        2
      ) as progress_percentage
    FROM mandalart_cells c
    JOIN mandalarts m ON c.mandalart_id = m.id
    WHERE m.user_id = user_uuid AND c.parent_id IS NULL
    
    UNION ALL
    
    -- 자식 셀들 (2레벨까지)
    SELECT 
      c.id,
      c.mandalart_id,
      c.parent_id,
      c.topic,
      c.memo,
      c.color,
      c.position,
      c.depth,
      c.is_completed,
      ct.level + 1,
      ct.total_cells,
      ct.completed_cells,
      ct.progress_percentage
    FROM mandalart_cells c
    JOIN cell_tree ct ON c.parent_id = ct.cell_id
    WHERE ct.level < 2
  )
  SELECT * FROM cell_tree
  ORDER BY mandalart_id, level, position;
END;
$$ LANGUAGE plpgsql;
```

### 3. 캐싱 전략 개선

#### A. 현재 캐싱 문제
- 브라우저 메모리 캐시만 사용 (새로고침 시 초기화)
- TTL 5분으로 너무 짧음
- 캐시 무효화 전략 부족

#### B. 개선 방안
```typescript
// IndexedDB 기반 영구 캐시
class PersistentCellCache {
  private dbName = 'mandalart-cache';
  private version = 1;
  private db: IDBDatabase | null = null;
  
  // 캐시 무효화 전략
  async invalidateCache(cellId: string) {
    // 해당 셀과 연관된 모든 캐시 무효화
    await this.invalidateParentChain(cellId);
    await this.invalidateChildChain(cellId);
  }
  
  // 백그라운드 프리로딩
  async preloadUserData() {
    // 앱 시작 시 사용자의 모든 데이터 백그라운드 로딩
  }
}
```

## 📊 성능 개선 예상 효과

### 1. 쿼리 개수 감소
- **현재**: 홈페이지 로딩 시 10-15개 쿼리
- **최적화 후**: 1-2개 쿼리 (90% 감소)

### 2. 로딩 시간 단축
- **현재**: 2-3초 (네트워크 상태에 따라)
- **최적화 후**: 0.5-1초 (60-75% 단축)

### 3. 데이터베이스 부하 감소
- **현재**: N+1 쿼리로 인한 높은 부하
- **최적화 후**: 단일 RPC 호출로 부하 분산

## 🛠 구현 우선순위

### Phase 1: 즉시 적용 가능 (High Priority)
1. **추가 인덱스 생성** - 기존 쿼리 성능 개선
2. **fetchUserCellsWithChildrenOptimized 활용** - 이미 구현된 최적화 로직 사용

### Phase 2: 중기 적용 (Medium Priority)  
1. **Supabase RPC 함수 구현** - 서버사이드 최적화
2. **영구 캐시 시스템 도입** - IndexedDB 기반

### Phase 3: 장기 적용 (Low Priority)
1. **실시간 데이터 동기화** - Supabase Realtime 활용
2. **서비스 워커 기반 오프라인 지원**

## 💡 권장사항

### 즉시 적용 권장
1. **인덱스 추가**: 기존 쿼리 성능을 즉시 개선
2. **RPC 함수 도입**: 복잡한 계층 쿼리를 서버사이드에서 처리
3. **캐시 TTL 연장**: 5분 → 30분으로 변경

### 단계적 적용 고려
- Phase 1만으로도 70-80% 성능 개선 예상
- Phase 2까지 적용 시 90% 이상 성능 개선 가능
- 사용자 피드백을 바탕으로 Phase 3 진행 여부 결정

## 🔧 구현 시 주의사항

1. **데이터 일관성**: RPC 함수 사용 시 트랜잭션 보장
2. **호환성**: 기존 API와의 하위 호환성 유지  
3. **에러 처리**: 새로운 최적화 로직의 폴백 전략 필요
4. **모니터링**: 성능 개선 효과 측정을 위한 로깅 추가