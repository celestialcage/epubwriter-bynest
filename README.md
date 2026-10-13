# EPUB Writer

NestJS와 React로 만든 개인용 문서 작성 및 EPUB 생성 애플리케이션입니다.

Series → Book → Chapter → Document 구조로 문서를 관리하고, 작성한 문서를 Book 단위의 EPUB 파일로 변환해 다운로드할 수 있습니다.

개인적으로 실제 사용할 문서 작성 도구를 만드는 것을 목표로 했으며, 계층형 문서 관리와 EPUB 생성에 필요한 기능을 우선하여 구현했습니다.

## 주요 기능

- Series / Book / Chapter 계층형 문서 관리
- Series 없이 단독 Book 생성
- Chapter별 Document 작성 및 수정
- Markdown 기반 문서 작성
- Book 단위 EPUB 생성 및 다운로드
- Series / Book EPUB metadata 관리
- Series metadata를 Book에서 상속
- Series / Book / Chapter / Document 휴지통 이동
- 계층 삭제 항목 그룹 단위 복원 및 영구 삭제
- 저장하지 않은 변경사항이 있을 때 페이지 이동 경고
- Book별 Chapter / Document 구성 및 EPUB 목차 미리보기

## Tech Stack

### Backend

- NestJS
- TypeScript
- TypeORM
- SQLite (better-sqlite3)
- epub-gen-memory
- class-validator
- marked
- sanitize-html

### Frontend

- React
- TypeScript
- Vite
- TanStack Query
- Zustand
- Tailwind CSS
- React Router

## Domain Structure

```text
Series
 └─ Book
     └─ Chapter
         └─ Document

Book
 └─ Chapter
     └─ Document
```

Book은 Series 없이 단독으로 존재할 수 있습니다.

Series, Book, Chapter는 `Folder` Entity와 `FolderKind`를 이용해 표현하며, Document는 실제 본문 데이터를 가지는 별도 Entity로 관리합니다.

## 주요 설계 결정

### Adjacency List 기반 계층 구조

계층형 Folder 구현 방식으로 Materialized Path도 검토했지만 현재 서비스의 계층은 `Series → Book → Chapter`로 깊이가 짧고 구조가 고정되어 있습니다.

또한 EPUB 생성 시에도 특정 Book 아래의 Chapter와 Document를 순서대로 조회하는 것이 주요 사용 패턴이기 때문에 별도의 경로 정보를 관리하는 것보다 `parentId`를 이용한 Adjacency List 방식이 현재 규모에 적합하다고 판단했습니다.

### Folder + FolderKind (단일 테이블)

Series, Book, Chapter는 제목, 정렬 순서, 부모 관계 등 대부분의 속성을 공유합니다.

따라서 각각 별도의 Entity로 분리하지 않고 하나의 `Folder` Entity에서 다음 `FolderKind`로 구분합니다.

```text
SERIES
BOOK
CHAPTER
```

대신 서비스 계층에서 다음 관계를 검증합니다.

```text
Series → Book
Book → Chapter
Chapter → Document
```

Document는 본문 데이터를 가지며 Folder와 역할이 다르기 때문에 별도 Entity로 분리했습니다.

### 삭제 그룹을 이용한 휴지통 정책

Series나 Book처럼 상위 항목을 삭제하면 여러 Folder와 Document가 동시에 휴지통으로 이동합니다.

이때 같은 삭제 작업에 포함된 항목을 다시 하나의 단위로 복원할 수 있도록 삭제 작업마다 UUID 기반 `deletedGroupId`를 생성합니다.

같은 작업으로 삭제된 Series / Book / Chapter / Document는 동일한 `deletedGroupId`를 가지며, 휴지통에서는 삭제 작업의 root 항목만 표시합니다.

복원과 영구 삭제 역시 이 그룹을 기준으로 처리합니다.

### EPUB metadata 상속 정책

EPUB metadata는 최종적으로 Book에 적용되지만 같은 Series의 여러 Book에서 저자, 출판사, 언어 등의 값이 반복될 수 있습니다.

따라서 Series에도 metadata를 저장할 수 있도록 하고 Book의 해당 값이 `null`인 경우 Series의 값을 사용합니다.

```text
Book metadata
      ↓ 값이 없는 경우
Series metadata
      ↓ 값이 없는 경우
default value
```

이를 통해 Series 공통 metadata를 유지하면서 필요한 Book만 개별 값을 재정의할 수 있습니다.

## EPUB 생성

EPUB은 Book 단위로 생성합니다.

```text
Book
 ↓
Chapter 정렬
 ↓
Document 정렬
 ↓
Markdown → HTML
 ↓
HTML sanitize
 ↓
EPUB section 구성
 ↓
epub-gen-memory
 ↓
.epub 다운로드
```

Chapter는 EPUB 내에서 하나의 구분 섹션으로 만들고, 각 Document를 그 뒤의 개별 섹션으로 변환합니다.

Document 본문은 Markdown을 HTML로 변환한 뒤 sanitize하여 EPUB에 포함합니다.

## 프론트 상태 관리

서버에서 가져오는 데이터는 TanStack Query로 관리합니다.

- Library
- Chapter / Document 목록
- Document 상세
- EPUB metadata
- Trash

Zustand는 서버 데이터와 별개의 UI 상태에 사용합니다.

- Series / Chapter 펼침 상태
- 저장되지 않은 변경사항 추적

## 현재 구현 범위

현재 MVP에서 실제 문서 작성부터 Book 단위 EPUB 다운로드까지 사용할 수 있는 상태를 목표로 구현했습니다.

일부 편의 기능은 향후 실사용하면서 필요에 따라 추가할 예정입니다.

### 향후 Roadmap

- [ ] Chapter / Document 순서 변경
- [ ] EPUB 생성 시 포함할 Chapter 선택
- [ ] 현재 도메인 구조를 기준으로 테스트 재구성
- [ ] 실사용 중 발견되는 UI / UX 개선

## Testing

초기 구현 단계에서 Jest 단위 테스트와 SQLite in-memory DB 기반 통합 테스트를 작성했지만, 이후 Folder 구조와 EPUB 생성 단위를 변경하면서 기존 테스트와 현재 구현 간 차이가 생겼습니다.

현재는 MVP 기능 구현과 실제 사용을 우선했으며, 향후 기능을 추가하거나 핵심 도메인 로직을 변경할 때 현재 구조를 기준으로 테스트를 다시 구성할 예정입니다.

우선적으로 테스트할 영역은 다음과 같습니다.

- Folder 계층 관계 검증
- 삭제 그룹 단위 휴지통 / 복구
- Series → Book EPUB metadata 상속
- Document CRUD
- Book 단위 EPUB 생성