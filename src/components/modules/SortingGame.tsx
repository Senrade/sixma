import { RetroWindow } from "./RetroWindow";

export interface SortingGameProps {
  poolItems: { id: string; text: string }[];
  onSort?: (sequence: string[]) => void;
}

export function SortingGame({ poolItems, onSort }: SortingGameProps) {
  void onSort; // presentation only
  return (
    <RetroWindow title="Sort.exe — Sequence Builder">
      <div className="grid gap-2 md:grid-cols-2">
        {/* Bank */}
        <div className="bg-[#c0c0c0] p-2 shadow-[inset_2px_2px_0_#808080,inset_-1px_-1px_0_#fff]">
          <div className="mb-2 bg-[#000080] px-1 py-0.5 text-[10px] font-bold text-white">
            ▼ EVIDENCE BANK
          </div>
          <div className="space-y-1">
            {poolItems.map((item) => (
              <div
                key={item.id}
                draggable
                className="flex cursor-grab items-center gap-2 bg-[#c0c0c0] px-2 py-1 text-xs shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] active:cursor-grabbing"
              >
                <span className="text-[10px] text-[#606060]">≡</span>
                <span className="flex-1">{item.text}</span>
                <span className="bg-white px-1 text-[10px] text-[#606060] shadow-[inset_1px_1px_0_#808080]">
                  {item.id}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Drop slots */}
        <div className="bg-[#c0c0c0] p-2 shadow-[inset_2px_2px_0_#808080,inset_-1px_-1px_0_#fff]">
          <div className="mb-2 bg-[#000080] px-1 py-0.5 text-[10px] font-bold text-white">
            ▼ TIMELINE
          </div>
          <div className="space-y-1">
            {poolItems.map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 border-2 border-dashed border-[#808080] bg-white/50 px-2 py-2 text-xs text-[#808080]"
              >
                <span className="flex h-5 w-5 items-center justify-center bg-[#000080] text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="italic">— drop here —</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="mt-2 flex items-center justify-between bg-[#c0c0c0] px-2 py-1 text-[10px] shadow-[inset_1px_1px_0_#808080,inset_-1px_-1px_0_#fff]">
        <span>Items: {poolItems.length}</span>
        <span>Status: Ready</span>
      </div>
    </RetroWindow>
  );
}

export default SortingGame;
