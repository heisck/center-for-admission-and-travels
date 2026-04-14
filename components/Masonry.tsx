"use client"

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

/* ---------- lazy-but-early GSAP loader ---------- */
let gsapLoader: Promise<typeof import('gsap')> | null = null;
let gsapInstance: typeof import('gsap').gsap | null = null;

function ensureGsapLoading() {
  if (!gsapLoader) {
    gsapLoader = import('gsap').then((mod) => {
      gsapInstance = mod.gsap;
      return mod;
    });
  }
}

// Start loading immediately at module evaluation time
ensureGsapLoading();

/* ---------- hooks ---------- */

const useMedia = (queries: string[], values: number[], defaultValue: number): number => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue;
    return values[queries.findIndex(q => window.matchMedia(q).matches)] ?? defaultValue;
  };

  const [value, setValue] = useState<number>(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => window.matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => window.matchMedia(q).removeEventListener('change', handler));
  }, [defaultValue, queries, values]);

  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(
    urls.map(
      src =>
        new Promise<void>(resolve => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

/* ---------- types ---------- */

interface Item {
  id: string;
  img: string;
  url: string;
  height: number;
}

interface GridItem extends Item {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MasonryProps {
  items: Item[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  enableHoverEffects?: boolean;
}

/* ---------- component ---------- */

const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  colorShiftOnHover = false,
  enableHoverEffects = true
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [ready, setReady] = useState(false);
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const getStartOffset = (item: GridItem) => {
    let direction = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'] as const;
      const seededHash = (str: string) => {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
          h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
        }
        return h;
      };
      direction = dirs[seededHash(String(item.id)) % dirs.length];
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: item.y - 120 };
      case 'bottom':
        return { x: item.x, y: item.y + 120 };
      case 'left':
        return { x: item.x - 120, y: item.y };
      case 'right':
        return { x: item.x + 120, y: item.y };
      case 'center': {
        const rect = containerRef.current?.getBoundingClientRect();
        const cx = rect ? rect.width / 2 - item.w / 2 : item.x;
        const cy = rect ? rect.height / 2 - item.h / 2 : item.y;
        return { x: cx, y: cy };
      }
      default:
        return { x: item.x, y: item.y + 80 };
    }
  };

  // Preload images + GSAP in parallel, then mark ready
  useEffect(() => {
    let active = true;

    const readyTimer = window.setTimeout(() => {
      if (active) setReady(true);
    }, 900);

    Promise.all([
      preloadImages(items.map(i => i.img)),
      gsapLoader,
    ]).then(() => {
      if (!active) return;
      window.clearTimeout(readyTimer);
      setReady(true);
    });

    return () => {
      active = false;
      window.clearTimeout(readyTimer);
    };
  }, [items]);

  const grid = useMemo<GridItem[]>(() => {
    if (!width) return [];
    const colHeights = new Array(columns).fill(0);
    const gap = 16;
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      const height = child.height / 2;
      const y = colHeights[col];

      colHeights[col] += height + gap;
      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!ready || !gsapInstance || grid.length === 0) return;
    const gsap = gsapInstance;

    if (!hasMounted.current && !prefersReducedMotion) {
      // Entrance animation: set start positions, then animate to final
      grid.forEach((item) => {
        const start = getStartOffset(item);
        gsap.set(`[data-key="${item.id}"]`, {
          x: start.x,
          y: start.y,
          scale: 0.92,
          opacity: 0,
          force3D: true,
        });
      });

      // Single batched animation with stagger
      const targets = grid.map(item => `[data-key="${item.id}"]`);
      gsap.to(targets, {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: stagger,
        force3D: true,
        overwrite: true,
        // Per-target final positions via function values
        x: (_index: number) => grid[_index].x,
        y: (_index: number) => grid[_index].y,
      });
    } else {
      // Resize / subsequent layout — snap to position
      grid.forEach((item) => {
        gsap.to(`[data-key="${item.id}"]`, {
          x: item.x,
          y: item.y,
          opacity: 1,
          scale: 1,
          duration: prefersReducedMotion ? 0 : duration,
          ease,
          overwrite: 'auto',
          force3D: true,
        });
      });
    }

    hasMounted.current = true;
  }, [grid, ready, stagger, animateFrom, duration, ease, prefersReducedMotion]);

  const handleMouseEnter = (id: string, element: HTMLElement) => {
    if (!enableHoverEffects || prefersReducedMotion || !gsapInstance) return;
    const gsap = gsapInstance;

    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay') as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (id: string, element: HTMLElement) => {
    if (!enableHoverEffects || prefersReducedMotion || !gsapInstance) return;
    const gsap = gsapInstance;

    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay') as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="absolute"
          style={{
            willChange: 'transform, opacity',
            width: item.w,
            height: item.h,
            opacity: 0,
          }}
          onClick={() => window.open(item.url, '_blank', 'noopener')}
          onMouseEnter={e => handleMouseEnter(item.id, e.currentTarget)}
          onMouseLeave={e => handleMouseLeave(item.id, e.currentTarget)}
        >
          <div
            className="relative w-full h-full bg-cover bg-center rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)]"
            style={{ backgroundImage: `url(${item.img})` }}
          >
            {colorShiftOnHover && (
              <div className="color-overlay absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;
