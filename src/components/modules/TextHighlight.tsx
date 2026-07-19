import { RetroWindow } from "./RetroWindow";

export interface TextHighlightProps {
  postAuthor: string;
  postTime: string;
  content: string;
  socraticQuiz?: {
    question: string;
    options: string[];
  };
  onSelectionComplete?: (start: number, end: number) => void;
}

export function TextHighlight({
  postAuthor,
  postTime,
  content,
  socraticQuiz,
  onSelectionComplete,
}: TextHighlightProps) {
  // Tokenize while preserving spaces + order. Split on whitespace but keep whitespace tokens.
  const tokens = content.split(/(\s+)/);
  let cursor = 0;

  const handleMouseUp = () => {
    if (!onSelectionComplete) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const anchor = sel.anchorNode?.parentElement as HTMLElement | null;
    const focus = sel.focusNode?.parentElement as HTMLElement | null;
    const a = anchor?.dataset.index ? parseInt(anchor.dataset.index, 10) : NaN;
    const f = focus?.dataset.index ? parseInt(focus.dataset.index, 10) : NaN;
    if (Number.isNaN(a) || Number.isNaN(f)) return;
    onSelectionComplete(Math.min(a, f), Math.max(a, f));
  };

  return (
    <RetroWindow title="AnonForum.exe — thread://viewer">
      {/* Simulated forum post */}
      <div className="bg-white p-3 shadow-[inset_2px_2px_0_#808080,inset_-1px_-1px_0_#fff]">
        <div className="mb-2 flex items-center gap-2 border-b border-dashed border-[#808080] pb-1">
          <div className="h-8 w-8 bg-[#000080] text-center text-[10px] leading-8 text-white shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff]">
            ??
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold">{postAuthor}</div>
            <div className="text-[10px] text-[#606060]">{postTime}</div>
          </div>
          <div className="text-[10px] text-[#606060]">#anonymous</div>
        </div>

        <div
          onMouseUp={handleMouseUp}
          className="select-text whitespace-pre-wrap text-sm leading-relaxed text-black"
        >
          {tokens.map((token, index) => {
            const absoluteIndex = cursor;
            cursor += token.length;
            return (
              <span
                key={index}
                data-index={absoluteIndex}
                className="hover:bg-[#fff2a8]"
              >
                {token}
              </span>
            );
          })}
        </div>
      </div>

      {/* Socratic Quiz — retro system dialog */}
      {socraticQuiz && (
        <div className="mt-3 bg-[#c0c0c0] shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#dfdfdf,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#fff]">
          <div className="flex items-center justify-between bg-[#000080] px-1 py-0.5 text-white">
            <span className="text-xs font-bold">System — Critical Thinking</span>
            <button className="h-4 w-5 bg-[#c0c0c0] text-[10px] leading-none text-black shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff]">
              ✕
            </button>
          </div>
          <div className="flex gap-3 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-yellow-300 text-lg font-bold shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff]">
              ?
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold">{socraticQuiz.question}</p>
              <div className="mt-2 space-y-1">
                {socraticQuiz.options.map((opt, i) => (
                  <label
                    key={i}
                    className="flex cursor-pointer items-start gap-2 bg-white px-2 py-1 text-xs shadow-[inset_1px_1px_0_#808080,inset_-1px_-1px_0_#fff]"
                  >
                    <input type="radio" name="socratic" className="mt-0.5" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button className="min-w-[70px] bg-[#c0c0c0] px-3 py-1 text-xs shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] active:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]">
                  OK
                </button>
                <button className="min-w-[70px] bg-[#c0c0c0] px-3 py-1 text-xs shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#fff,inset_-2px_-2px_0_#808080,inset_2px_2px_0_#dfdfdf] active:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#fff]">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RetroWindow>
  );
}

export default TextHighlight;
