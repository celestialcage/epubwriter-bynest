import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import "./App.css";
import { AppLayout } from "./components/common/AppLayout";
import DocumentCreate from "./components/pages/DocumentCreate";
import DocumentPage from "./components/pages/DocumentPage";
import EmptyPage from "./components/pages/EmptyPage";
import HomePage from "./components/pages/HomePage";
import NotFoundPage from "./components/pages/NotFoundPage";
import TrashPage from "./components/pages/TrashPage";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* 최상위 랜딩 페이지: http://localhost:5173/ */}
      <Route path="/" element={<HomePage />} />
      {/* 공통 2단 사이드바 레이아웃 (부모 라우트) */}
      <Route path="/docu" element={<AppLayout />}>
        {/* 1. '/docu' 접속 시 -> AppLayout의 Outlet에 EmptyPage가 렌더링됨 */}
        <Route index element={<EmptyPage />} />
        <Route path="trash" element={<TrashPage />} />
        {/* 책만 선택 */}
        <Route path="books/:bookId" element={<EmptyPage />} />
        {/* 2. '/' 접속 시 -> Outlet에 EmptyPage가 들어감 */}
        <Route path="books/:bookId/new" element={<DocumentCreate />} />
        {/* 3. '/documents/1' 접속 시 -> Outlet에 DocumentPage가 들어감 */}
        <Route path="books/:bookId/docs/:docId" element={<DocumentPage />} />
      </Route>
      {/* 4. 잘못된 경로 처리 (404) */}
      <Route path="*" element={<NotFoundPage />} />
    </>,
  ),
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
