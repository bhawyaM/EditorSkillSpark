import { useCallback, useRef } from "react";

export default function useDragable() {

const handleToolBox = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection and other default behaviors
    
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Get existing transform values to maintain position
    const computedStyle = window.getComputedStyle(element);
    const matrix = computedStyle.transform;
    let currentX = 0;
    let currentY = 0;
    
    if (matrix !== 'none') {
        const values = matrix.split('(')[1].split(')')[0].split(',');
        currentX = parseFloat(values[4]) || 0;
        currentY = parseFloat(values[5]) || 0;
    }

    function onMouseMove(moveEvent: MouseEvent) {
        moveEvent.preventDefault();
        
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        // Add to existing position instead of replacing
        element.style.transform = `translate(${currentX + dx}px, ${currentY + dy}px)`;
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // Clean up any existing listeners first (in case of rapid clicks)
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}, []);

  return  handleToolBox ;
}
