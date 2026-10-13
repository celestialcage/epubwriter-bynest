import type { InputHTMLAttributes } from "react";
import cn from "classnames";

export default function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "border-b-1 border-b-gray200",
        "focus:border-b-gray600 focus:bg-bg2 focus:rounded-t-6",
        className,
      )}
      {...props}
    />
  );
}
