'use client';

import {useLayoutEffect, useState} from 'react';

/** One highlight moves between choices; it never changes their layout. */
export function useMovingSelection<T extends HTMLElement>(selected: string) {
  const [list, setList] = useState<T | null>(null);

  useLayoutEffect(() => {
    if (!list) return;
    let frame = 0;
    const measure = () => {
      const item = list.querySelector<HTMLElement>(selected);
      if (!item || !item.getClientRects().length) {
        cancelAnimationFrame(frame);
        delete list.dataset.selectionReady;
        return;
      }
      const box = item.getBoundingClientRect(), parent = list.getBoundingClientRect();
      const values = {
        x: box.left - parent.left + list.scrollLeft - list.clientLeft,
        y: box.top - parent.top + list.scrollTop - list.clientTop,
        width: box.width,
        height: box.height,
      };
      for (const [key, value] of Object.entries(values)) {
        list.style.setProperty(`--selection-${key}`, `${value}px`);
      }
      if (!list.dataset.selectionReady) {
        list.dataset.selectionReady = 'initial';
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => { list.dataset.selectionReady = 'true'; });
      }
    };
    measure();
    const changes = new MutationObserver(measure);
    changes.observe(list, {subtree: true, childList: true, attributes: true, attributeFilter: ['data-state', 'aria-current', 'class']});
    const sizes = new ResizeObserver(measure);
    sizes.observe(list);
    for (const item of list.querySelectorAll('button')) sizes.observe(item);
    return () => { cancelAnimationFrame(frame); changes.disconnect(); sizes.disconnect(); };
  }, [list, selected]);

  return setList;
}
