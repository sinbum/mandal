# 서비스 및 훅 구현 문서

## 🔧 MandalartService

만다라트 CRUD 작업을 처리하는 핵심 서비스 클래스입니다.

```ts
export class MandalartService {
  // 만다라트 조회
  async getMandalart(id: string): Promise<Mandalart | null>;
  
  // 사용자의 만다라트 목록 조회
  async getUserMandalarts(): Promise<Array<{
    id: string,
    title: string,
    createdAt: string,
    updatedAt: string
  }>>;
  
  // 만다라트 삭제
  async deleteMandalart(id: string): Promise<void>;
  
  // 새로운 셀 생성
  async createCellWithData(
    mandalartId: string,
    position: number,
    parentData: any
  ): Promise<MandalartCell>;
}
```

## 🪝 커스텀 훅

### useMandalart

만다라트 데이터 관리와 조작을 위한 훅입니다.

**주요 기능:**
- 만다라트 데이터 로드 및 캐싱
- 셀 데이터 업데이트
- 상태 관리 (로딩, 에러 등)

### useMandalartNavigation

만다라트 내 네비게이션을 위한 훅입니다.

**Props:**
```ts
interface UseMandalartNavigationProps {
  initialCell?: MandalartCell | null;
  data?: Mandalart | null;
}
```

**주요 기능:**
- 현재 경로 관리
- 셀 간 이동 처리
- 경로 히스토리 관리

## 🔄 데이터 흐름

1. `MandalartService`를 통한 데이터 CRUD
2. `useMandalart` 훅에서 상태 관리
3. `useMandalartNavigation`을 통한 UI 네비게이션
4. 컴포넌트에서 Props를 통한 데이터 표시

## 📌 주의사항

- 모든 데이터 조작은 `MandalartService`를 통해 수행
- 상태 관리는 훅을 통해 중앙화
- 컴포넌트는 Props를 통해서만 데이터 접근 