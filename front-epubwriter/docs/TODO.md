# 메인 페이지

##  새 시리즈 버튼

- [ ] [API] 시리즈 생성 api

## 새 책 만들기 버튼

- [x] DocumentCreate 페이지로 이동

## 시리즈 / 단일 책 리스트

- [ ] [API] 시리즈 / 단일 책 리스트 조회 api - `GET /books/series-and-single`
- [x] DocumentDetail 페이지로 이동

# Document

## 1단 사이드바(시리즈/책)

### API

- [ ] [API] 시리즈 / 단일 책 계층 리스트 조회 api - `GET /books/series-and-single` (만든 거 연결하기)
- [ ] [API] 시리즈에 단일 책 추가 api - `PATCH /book/:id` ? book 관련 일부 수정은 전부 이걸로 처리
- [ ] [API] 시리즈 생성 api - `POST /series`
- [ ] [API] 단일 책 생성 api - `POST /book`
- [ ] [API] 시리즈 삭제(휴지통) api
- [ ] [API] 책 삭제(휴지통) api

### UI

- [ ] [UI] 시리즈 생성 ui
- [ ] [UI] 단일 책 생성 ui


## 2단 사이드바(챕터/문서)

- [ ] 문서 생성 버튼 클릭 - DocumentCreate 페이지 열고 챕터 선택

### API

- [ ] 챕터 / 문서 계층 리스트 조회 api
- [ ] 챕터 생성 api - `POST /chapter`
- [ ] 챕터 수정 api - 이름 변경 - `PATCH /chapter`
- [ ] 챕터 순서 변경 api - sortOrder 변경 (초기) - `PATCH /chapter/:id`
- [ ] 문서 순서 변경 api - sortOrder 변경 (초기) - `PATCH /docu/:id`
- [ ] 챕터 삭제(휴지통) api
- [ ] 문서 삭제(휴지통) api

### UI

- [ ] 챕터 생성 ui 만들기
- [ ] 문서 생성 버튼 ui - 새 문서 작성 시 소속될 챕터 고르기.
- [ ] 챕터 순서 변경 ui - sortOrder 변경 (초기)
- [ ] 문서 순서 변경 ui - sortOrder 변경 (초기)

- [ ] 챕터 순서 변경 ui - 위아래 변경 (후순위)
- [ ] 문서 순서 변경 ui - 위아래 변경 (후순위)

- [ ] 챕터 순서 변경 ui - 드래그앤드롭 변경 (후순위2)
- [ ] 문서 순서 변경 ui - 드래그앤드롭 변경 (후순위2)

## 작성 화면 (DocumentCreate)

### API

- [ ] 문서 생성 api - `POST /docu`

### UI

- [ ] 확인 후 정리

## 상세 화면 (DocumentDetail)

### API

- [ ] 문서 조회 api - `GET /docu/:id`
- [ ] 문서 삭제(휴지통) api (만든 거 연결)

### UI

- [ ] 확인 후 정리

## 수정 화면 (DocumentEdit)

### API

- [ ] 문서 수정 api - `PATCH /docu/:id`

### UI

- [ ] 확인 후 정리

## 우측 사이드바 (책 메타데이터)

- [ ] 메타데이터 생성 -> 책 생성 시 자동 생성
- [ ] epub 패키징 대상 구성 콘텐츠 요약 정보 조회 -> 1,2단 사이드바 조회 데이터 재가공

### API

- [ ] 메타데이터 조회 api
- [ ] 메타데이터 수정 api

- [ ] epub 다운로드 api

### UI

- [ ] 확인 후 정리

# 휴지통

### API

- [ ] 휴지통 조회 api
- [ ] 휴지통 비우기 api
- [ ] 시리즈/책/챕터 단건 영구삭제 api
- [ ] 시리즈/책/챕터 단건 복원 api
- [ ] 문서 단건 영구삭제 api
- [ ] 문서 단건 복원 api

- [ ] 복수 영구삭제 api(후순위)
- [ ] 복수 복원 api(후순위)

### UI

- [ ] 휴지통 조회 리스트
- [ ] 휴지통 비우기 버튼
- [ ] 단건 영구삭제 ui
- [ ] 단건 복원 ui

- [ ] 복수 건 영구삭제 ui(후순위)
- [ ] 복수 건 복원 ui(후순위)