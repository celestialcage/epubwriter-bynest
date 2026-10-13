import cn from "classnames";
import type { ComponentProps } from "react";

// React 19에서는 함수 컴포넌트도 ref를 일반 prop으로 받을 수 있어서 forwardRef가 필요 없고,
// props 타입만 바꾸면 ...props로 그대로 전달
export default function TextArea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea className={cn("pb-16 outline-none", className)} {...props} />
  );
}
