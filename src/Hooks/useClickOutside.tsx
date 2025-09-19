import { useEffect } from "react";

type UseClickOutsideProps = {
  ref: React.RefObject<HTMLElement> | React.RefObject<null>;
  onClickOutside: () => void;
  enabled?: boolean; // default = true
  bubbling?: boolean; // default = false
};

export function useClickOutside({ ref, onClickOutside, enabled = true,bubbling }: UseClickOutsideProps) {
  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
        if(bubbling){
          event.stopPropagation();
          event.preventDefault();
        }

      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    }

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [ref, onClickOutside, enabled]);
}
