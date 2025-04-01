# 서비스 및 훅 구현 문서

## 🔧 MandalartService

만다라트 CRUD 작업을 처리하는 핵심 서비스 클래스입니다.

```ts
export class MandalartService {
  // 셀 데이터 조회
  async fetchCellById(cellId: string): Promise<MandalartCell | null>;
  
  // 셀의 자식 셀 로드
  async fetchChildrenByCellId(cellId: string): Promise<MandalartCell[]>;
  
  // 셀 업데이트
  async updateCell(cellId: string, updates: Partial<MandalartCell>): Promise<void>;
  
  // 새 셀 생성
  async createCell(parentCellId: string, cellData: Partial<MandalartCell>): Promise<string>;
  
  // 셀 완료 상태 토글
  async toggleCellCompletion(cellId: string, isCompleted: boolean): Promise<void>;
  
  // 새 만다라트 생성
  async createMandalart(title: string): Promise<string>;
  
  // 사용자의 모든 루트 셀 가져오기
  async fetchUserCells(): Promise<MandalartCell[]>;
  
  // 셀 경로 구성
  async buildCellPath(cellId: string): Promise<MandalartCell[]>;
  
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
  async deleteMandalart(mandalartId: string): Promise<void>;
  
  // 자식 셀 목록 가져오기
  async getChildCells(cellId: string): Promise<MandalartCell[]>;
}

// 서비스 API 헬퍼 함수들
export const mandalartAPI = {
  fetchCellById: (cellId: string) => new MandalartService().fetchCellById(cellId),
  fetchChildrenByCellId: (cellId: string) => new MandalartService().fetchChildrenByCellId(cellId),
  updateCell: (cellId: string, updates: Partial<MandalartCell>) => new MandalartService().updateCell(cellId, updates),
  createCell: (parentCellId: string, cellData: Partial<MandalartCell>) => new MandalartService().createCell(parentCellId, cellData),
  toggleCellCompletion: (cellId: string, isCompleted: boolean) => new MandalartService().toggleCellCompletion(cellId, isCompleted),
  createMandalart: (title: string) => new MandalartService().createMandalart(title),
  fetchUserCells: () => new MandalartService().fetchUserCells(),
  buildCellPath: (cellId: string) => new MandalartService().buildCellPath(cellId),
  getMandalart: (id: string) => new MandalartService().getMandalart(id),
  getUserMandalarts: () => new MandalartService().getUserMandalarts(),
  deleteMandalart: (mandalartId: string) => new MandalartService().deleteMandalart(mandalartId),
  getChildCells: (cellId: string) => new MandalartService().getChildCells(cellId)
};
```

## 🪝 useMandalart

만다라트 데이터 관리와 조작을 위한 핵심 훅입니다.

### 반환 값

```ts
interface UseMandalartResult {
  mandalart: MandalartHierarchical | null;       // 현재 만다라트 데이터
  isLoading: boolean;                           // 로딩 상태
  error: string | null;                         // 오류 메시지
  updateCell: (cellId: string, updates: Partial<MandalartCell>) => void;  // 셀 업데이트
  createMandalart: (title: string) => Promise<string>;                    // 새 만다라트 생성
  fetchMandalartList: () => Promise<Array<{...}>>;                        // 만다라트 목록 조회 
  createCell: (mandalartId: string, position: number, data: Partial<MandalartCell>) => Promise<string>;  // 셀 생성
  toggleCellCompletion: (cellId: string) => Promise<void>;               // 셀 완료 상태 토글
  deleteMandalart: (id: string) => Promise<void>;                        // 만다라트 삭제
  navigationPath: MandalartCell[];                                       // 네비게이션 경로
  currentCell: MandalartCell | null;                                     // 현재 선택된 셀
  navigateToCell: (cellId: string) => void;                              // 특정 셀로 이동
  navigateToParent: () => void;                                          // 부모 셀로 이동
  loadChildrenForCell: (cellId: string) => Promise<void>;                // 자식 셀 로드
  // ... 기타 유틸리티 함수들
}
```

### 의존성 배열 최적화

React 의존성 배열(dependency array) 관련 문제를 해결했습니다:

```ts
// 특정 셀의 자식 셀 로드
const loadChildrenForCell = useCallback(async (cellId: string) => {
  // ... 함수 내용 ...
}, [mandalart, mandalartId, isLoading, setCurrentCellId, buildPathForCell, findCellInHierarchy]);

// 특정 셀의 자식 셀 로드 (ID로)
const loadChildrenForCellById = useCallback(async (cellId: string) => {
  // ... 함수 내용 ...
}, [mandalart, findCellInHierarchy]);
```

* 수정 전에는 `findCell` 함수를 의존성으로 잘못 사용했지만, 실제 코드에서는 `findCellInHierarchy` 유틸리티를 직접 사용하고 있었습니다.
* 의존성 배열에 정확한 함수를 명시하여 React 훅 규칙을 준수하도록 수정했습니다.

### 상태 관리

useMandalart 훅은 다음과 같은 주요 상태를 관리합니다:

```ts
const [mandalart, setMandalart] = useState<MandalartHierarchical | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(!!mandalartId);
const [error, setError] = useState<string | null>(null);
```

또한 `useMandalartNavigation` 훅을 사용하여 네비게이션 상태를 관리합니다:

```ts
const {
  navigationPath,
  currentCellId,
  buildPathForCell,
  navigateToParent,
  setCurrentCellId,
  setNavigationPath,
  breadcrumbPath,
  fillEmptyCells
} = useMandalartNavigation({ initialCell: mandalart?.rootCell });
```

## 🪝 useMandalartNavigation

만다라트 내 네비게이션을 위한 훅입니다.

**주요 기능:**
- 현재 경로 관리 (`navigationPath`, `breadcrumbPath`)
- 셀 간 이동 처리 (`navigateToCell`, `navigateToParent`)
- 경로 히스토리 관리 (`buildPathForCell`)
- 빈 셀 자동 채우기 (`fillEmptyCells`)

## 🔄 데이터 흐름

```
1. UI 이벤트 (클릭, 폼 제출 등)
   ↓
2. 컴포넌트 이벤트 핸들러
   ↓
3. useMandalart 훅 함수 호출
   ↓
4. mandalartAPI 서비스 메서드 호출
   ↓
5. Supabase DB 작업 수행
   ↓
6. API 응답 반환
   ↓
7. 훅 내부 상태 업데이트
   ↓
8. React 컴포넌트 리렌더링
   ↓
9. UI 업데이트
```

## 📌 성능 최적화 포인트

1. **불필요한 리렌더링 방지**
   - 의존성 배열 최적화
   - 메모이제이션 적용 (`useCallback`, `useMemo`)

2. **데이터 캐싱 전략**
   - 이미 로드된 셀 데이터 재사용
   - 필요 시에만 API 호출 수행

3. **계층적 상태 업데이트**
   - 특정 셀만 업데이트하여 전체 리렌더링 방지
   - 불변성 유지를 위한 헬퍼 함수 사용

## 📌 주요 페이지 및 기능

1. **홈 페이지 (`/`)**
   - 사용자의 만다라트 목록 표시
   - 새 만다라트 생성
   - 만다라트 삭제

2. **셀 페이지 (`/cell/:id`)**
   - 특정 셀과 그 자식 셀 표시
   - 셀 내용 편집
   - 셀 계층 간 이동
   - 완료 상태 토글

3. **인증 페이지 (`/auth/**`)**
   - 로그인/회원가입
   - 비밀번호 복구
   - 로그아웃 