import { RetroWindow } from "./RetroWindow";

export interface ImageForensicsProps {
  imageUrl: string;
  contextText: string;
  onTargetClick?: (x: number, y: number) => void;
}

export function ImageForensics({ imageUrl, contextText, onTargetClick }: ImageForensicsProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onTargetClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onTargetClick(x, y);
  };

  return (
    <RetroWindow title="Image Forensics Lab.exe">
      <div className="grid gap-2 md:grid-cols-[1fr_240px]">
        {/* Image area */}
        <div
          onClick={handleClick}
          className="relative aspect-video w-full cursor-crosshair overflow-hidden bg-black shadow-[inset_2px_2px_0_#000,inset_-2px_-2px_0_#dfdfdf,inset_4px_4px_0_#808080]"
        >
          <img src={imageUrl} alt="Evidence" className="h-full w-full object-cover [image-rendering:pixelated]" />
          {/* Investigation markers (visual only) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-4 top-4 h-6 w-6 rounded-full border-2 border-dashed border-[#ff0000] animate-pulse" />
            <div className="absolute right-8 bottom-8 h-8 w-8 rounded-full border-2 border-dashed border-[#ffff00] animate-pulse" />
            <div className="absolute left-1/2 top-1/3 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-dashed border-[#00ff00] animate-pulse" />
          </div>
          {/* Scanline overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_3px)]" />
        </div>

        {/* Instruction panel */}
        <div className="bg-[#c0c0c0] p-2 shadow-[inset_-1px_-1px_0_#fff,inset_1px_1px_0_#808080]">
          <div className="mb-2 bg-[#000080] px-1 py-0.5 text-[10px] font-bold text-white">
            ▼ INVESTIGATION LOG
          </div>
          <p className="text-xs leading-snug">{contextText}</p>
          <div className="mt-3 border-t border-[#808080] pt-2 text-[10px] text-[#404040]">
            » Click on suspicious regions to mark them as evidence.
          </div>
          <div className="mt-2 flex gap-1">
            <div className="h-3 w-3 rounded-full bg-red-500 shadow-[inset_-1px_-1px_0_#000]" />
            <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-[inset_-1px_-1px_0_#000]" />
            <div className="h-3 w-3 rounded-full bg-green-500 shadow-[inset_-1px_-1px_0_#000]" />
          </div>
        </div>
      </div>
    </RetroWindow>
  );
}

export default ImageForensics;
