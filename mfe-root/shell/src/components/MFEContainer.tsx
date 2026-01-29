import { useEffect, useRef } from "react";

export const MFEContainer: React.FC<{
  mount: (el: HTMLElement) => void | (() => void);
}> = ({ mount }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cleanup = mount(ref.current);
    return () => cleanup?.();
  }, [mount]);

  return <div ref={ref} />;
};