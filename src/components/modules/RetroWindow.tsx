import type { ReactNode } from "react";

export interface RetroWindowProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}

export function RetroWindow({ title, children, onClose }: RetroWindowProps) {
  return (
    <div className="bg-[#c0c0c0] font-mono text-black shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#dfdfdf,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#fff]">
      {/* Title bar */}
      <div className="flex items-center justify-between bg-[#000080] px-1 py-0.5 text-white">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 bg-[#c0c0c0] shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff]" />
          <span className="text-xs font-bold tracking-wide">{title}</span>
        </div>
        <div className="flex gap-0.5">
          {["_", "▢", "✕"].map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={i === 2 ? onClose : undefined}
              className="h-5 w-5 bg-[#c0c0c0] text-black text-[10px] leading-none shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] active:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {/* Body */}
      <div className="p-2">{children}</div>
    </div>
  );
}

export default RetroWindow;
