import { useRef } from 'react';
import useWindowSize from "@react-hook/window-size";
import {
  usePositioner,
  useResizeObserver,
  useContainerPosition,
  MasonryScroller
} from "masonic";

function CustomMasonry({ items, render }) {
  const containerRef = useRef(null);

  const [windowWidth, windowHeight] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    windowHeight
  ]);
  // The key to this entire example lies in the usePositioner()
  // hook
  const positioner = usePositioner(
    { width, columnWidth: 300, columnGutter: 8 },
    // This is our dependencies array. When these dependencies
    // change, the positioner cache will be cleared and the
    // masonry component will reset as a result.
    [items]
  );

  const resizeObserver = useResizeObserver(positioner);

  return (
    <div>
      <MasonryScroller
        positioner={positioner}
        resizeObserver={resizeObserver}
        containerRef={containerRef}
        items={items}
        height={windowHeight}
        offset={offset}
        overscanBy={6}
        columnGutter={16}
        columnWidth={220}
        render={render}></MasonryScroller>
    </div>
  )
}

export default CustomMasonry
