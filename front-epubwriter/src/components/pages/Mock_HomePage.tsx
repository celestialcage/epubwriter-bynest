import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Folder,
  Book,
  Plus,
  ChevronRight,
  MoreVertical,
  Clock,
  BookOpen,
} from "lucide-react";
import CreateSeriesModal from "../home/CreateSeriesModal";

// Mock Data: 실제로는 TanStack Query 등으로 백엔드(NestJS)에서 조회해옵니다.
const mockItems = [
  {
    id: "series-1",
    type: "SERIES", // 폴더/시리즈 타입
    title: "React & Modern Web 개발 가이드",
    bookCount: 4,
    updatedAt: "2026-03-25",
  },
  {
    id: "series-2",
    type: "SERIES",
    title: "판타지 소설 구상집",
    bookCount: 12,
    updatedAt: "2026-03-20",
  },
  {
    id: "book-1",
    type: "BOOK", // 단일 책 타입
    title: "NestJS 백엔드 아키텍처 단권",
    updatedAt: "2026-03-27",
    author: "김개발",
  },
  {
    id: "book-2",
    type: "BOOK",
    title: "개인 프로젝트 아이디어 노트",
    updatedAt: "2026-03-26",
    author: "김개발",
  },
];

export default function Mock_HomePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(mockItems);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 클릭 이벤트 핸들러
  const handleItemClick = (item) => {
    if (item.type === "SERIES") {
      // 시리즈 클릭 시 해당 시리즈 폴더 내부로 이동
      navigate(`/docu?seriesId=${item.id}`);
    } else {
      // 책 클릭 시 해당 문서/책 읽기 페이지로 이동
      navigate(`/docu/${item.id}`);
    }
  };

  const handleCreateNew = (type) => {
    if (type === "SERIES") {
      alert("새 시리즈 생성 모달 열기");
    } else {
      // 새 문서/책 작성 페이지로 이동
      navigate("/docu/new");
    }
  };

  // 시리즈 생성 백엔드 API 요청 핸들러
  const handleCreateSeries = async (formData) => {
    // 예: axios.post('/api/docu/series', formData);
    console.log("백엔드로 전송할 데이터:", formData);

    // API 호출을 흉내 낸 타임아웃
    await new Promise((resolve) => setTimeout(resolve, 800));
    alert(`"${formData.title}" 시리즈가 생성되었습니다!`);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 1. 상단 헤더 & 컨트롤 영역 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Shabetty's Library
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                시리즈와 단일 책을 관리하고 새 문서를 작성하세요.
              </p>
            </div>

            {/* 생성 버튼 그룹 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
              >
                <Folder className="w-4 h-4 text-amber-500" />
                <span>새 시리즈</span>
              </button>
              <button
                onClick={() => handleCreateNew("BOOK")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span className="text-white">새 책 만들기</span>
              </button>
            </div>
          </div>

          {/* 2. 빵부스러기 (Breadcrumb) 네비게이션 */}
          <nav className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-semibold text-slate-900 flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-blue-600" /> Root
            </span>
            {/* 하위 시리즈로 들어갔을 때 경로 표시 예시 */}
            {/* <ChevronRight className="w-4 h-4 text-slate-400" /> */}
            {/* <span>React 가이드</span> */}
          </nav>

          {/* 3. 그리드 카드 영역 */}
          {items.length === 0 ? (
            // 빈 상태 (Empty State)
            <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
              <Book className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700">
                아직 작성된 책이 없습니다
              </h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                새 시리즈를 만들거나 단일 책을 추가해 보세요.
              </p>
              <button
                onClick={() => handleCreateNew("BOOK")}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                첫 문서 작성하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((item) => {
                const isSeries = item.type === "SERIES";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`group relative flex flex-col justify-between p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
                      isSeries
                        ? "border-amber-200/80 bg-gradient-to-b from-amber-50/30 to-white hover:border-amber-400"
                        : "border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    {/* 카드 상단: 아이콘 & 더보기 버튼 */}
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`p-2.5 rounded-lg ${
                            isSeries
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {isSeries ? (
                            <Folder className="w-6 h-6 fill-amber-500/20" />
                          ) : (
                            <Book className="w-6 h-6" />
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // 카드 클릭 이벤트 전달 방지
                            alert(`${item.title} 옵션 메뉴`);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 카드 타이틀 */}
                      <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </div>

                    {/* 카드 하단 메타 정보 */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      {isSeries ? (
                        <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          시리즈 • {item.bookCount}권 포함
                        </span>
                      ) : (
                        <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          단일 책
                        </span>
                      )}

                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* 모달 컴포넌트 배치 */}
      <CreateSeriesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSeries}
      />
    </>
  );
}
