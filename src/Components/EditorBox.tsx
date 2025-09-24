import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { type SlideConfig } from "../assets/types/slidesData";
import { IconImport } from "./IconImport";
import ToolBox from "../Core-Components/Editor/ToolBox";
import AddLine from "../Core-Components/Editor/AddLine";
import TextInputWithEditor from "./TextInputWithEditor";
interface SavedSVG {
  id: string;
  content: string;
  timestamp: Date;
  elements: SVGElement[];
}

interface Point {
  x: number;
  y: number;
}

interface SVGElement {
  type: "circle" | "line" | "quadratic" | "cubic";
  points: Point[];
  color: string;
  strokeWidth: number;
  fillColor?: string;
}

const EditorBox = ({
  setSlides,
  slides,
  currentSlide,
}: {
  setSlides: React.Dispatch<React.SetStateAction<SlideConfig[]>>;
  slides: SlideConfig[];
  currentSlide: number;
}) => {
  const [visibleElements, setVisibleElements] = useState<string[]>([]);
  const [currentSVG, setCurrentSVG] = useState<SavedSVG | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<
    string | number | null
  >(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEditorBtn, setActiveEditorBtn] = useState<number | null>(null);
  const [addline, setAddLine] = useState<boolean>(false);

  // Track if current SVG has been processed
  const processedSVGRef = useRef<string | null>(null);

  // Function to convert SVG elements to SVG string
  const convertSVGElementsToSVGString = useCallback(
    (elements: SVGElement[]): string => {
      const svgElements = elements
        .map((element, index) => {
          switch (element.type) {
            case "circle":
              if (element.points.length > 0) {
                const point = element.points[0];
                return `<circle cx="${point.x}" cy="${
                  point.y
                }" r="10" stroke="${element.color}" stroke-width="${
                  element.strokeWidth
                }" fill="${element.fillColor || "transparent"}" />`;
              }
              break;
            case "line":
              if (element.points.length >= 2) {
                const [start, end] = element.points;
                return `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${element.color}" stroke-width="${element.strokeWidth}" />`;
              }
              break;
            case "quadratic":
              if (element.points.length >= 3) {
                const [start, control, end] = element.points;
                return `<path d="M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}" stroke="${element.color}" stroke-width="${element.strokeWidth}" fill="transparent" />`;
              }
              break;
            case "cubic":
              if (element.points.length >= 4) {
                const [start, control1, control2, end] = element.points;
                return `<path d="M ${start.x} ${start.y} C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${end.x} ${end.y}" stroke="${element.color}" stroke-width="${element.strokeWidth}" fill="transparent" />`;
              }
              break;
            default:
              return "";
          }
          return "";
        })
        .filter(Boolean)
        .join("\n");

      return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">${svgElements}</svg>`;
    },
    []
  );

  // Function to convert SVG string to data URL
  const svgToDataURL = useCallback((svgString: string): string => {
    const encodedSvg = encodeURIComponent(svgString);
    return `data:image/svg+xml,${encodedSvg}`;
  }, []);

  // Function to add SVG as image element to slide
  const addSVGToSlide = useCallback(
    (savedSVG: SavedSVG) => {
      const svgString = convertSVGElementsToSVGString(savedSVG.elements);
      const dataURL = svgToDataURL(svgString);
      console.log("Adding SVG to slide:", dataURL, svgString);

      const newImageElement = {
        id: `svg-img-${savedSVG.id}`,
        type: "image" as const,
        x: 50,
        y: 50,
        width: "fit-content",
        height: "fit-content",
        content: dataURL,
        src: dataURL,
        locked: false,
        borderRadius: 0,
        zIndex: 10000,
      };

      setSlides((prevSlides) => {
        const newSlides = [...prevSlides];
        newSlides[currentSlide].elements.push(newImageElement);
        return newSlides;
      });
    },
    [convertSVGElementsToSVGString, svgToDataURL, currentSlide, setSlides]
  );

  // Watch for changes in currentSVG and add it to slide
  useEffect(() => {
    if (currentSVG && processedSVGRef.current !== currentSVG.id) {
      // Check if this SVG is already added to slide to avoid duplicates
      const existingElement = slides[currentSlide]?.elements?.find(
        (el: any) => el.id === `svg-img-${currentSVG.id}`
      );

      if (!existingElement) {
        addSVGToSlide(currentSVG);
        processedSVGRef.current = currentSVG.id;
      }
    }
  }, [currentSVG, slides]);

  // Clear processed SVG when switching slides
  useEffect(() => {
    processedSVGRef.current = null;
  }, [currentSlide]);

  // Optimize state updates with useCallback and debouncing
  const updateElement = useCallback(
    (updatedEl: any) => {
      setSlides((prevSlides) => {
        const newSlides = [...prevSlides];
        const idx = newSlides[currentSlide].elements.findIndex(
          (el) => el.id === updatedEl.id
        );
        if (idx !== -1) {
          newSlides[currentSlide].elements[idx] = updatedEl;
        }
        return newSlides;
      });
    },
    [currentSlide, setSlides]
  );

  interface AnimatedElementProps {
    element: any;
    isVisible: boolean;
    delay?: number;
    onUpdateElement: (el: any) => void;
    selectedElementId: string | number | null;
    setSelectedElementId: (id: string | number | null) => void;
    editingId: string | number | null;
    setEditingId: (id: string | number | null) => void;
  }

const AnimatedElement: React.FC<AnimatedElementProps> = ({
  element,
  isVisible,
  delay = 0,
  onUpdateElement,
  selectedElementId,
  setSelectedElementId,
  editingId,
  setEditingId,
}) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<number>(0);

  // Dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).classList.contains("resize-handle")) return;
      if (editingId === element.id) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const startPos = { x: element.x, y: element.y };
      let isDragging = false;

      const dragEl = dragRef.current;
      if (dragEl) dragEl.style.zIndex = "1000";

      const onMove = (ev: MouseEvent) => {
        const deltaX = ev.clientX - startX;
        const deltaY = ev.clientY - startY;

        if (!isDragging && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
          isDragging = true;
          document.body.style.userSelect = "none";
          document.body.style.cursor = "move";
        }

        if (isDragging && dragEl) {
          dragEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }
      };

      const onUp = (ev: MouseEvent) => {
        if (isDragging) {
          const deltaX = ev.clientX - startX;
          const deltaY = ev.clientY - startY;
          onUpdateElement({ ...element, x: Math.max(0, startPos.x + deltaX), y: Math.max(0, startPos.y + deltaY) });
        } else {
          setSelectedElementId(element.id);
        }

        if (dragEl) dragEl.style.transform = "";
        dragEl && (dragEl.style.zIndex = "");

        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [element, editingId, onUpdateElement, setSelectedElementId]
  );

  // Resizing
  const handleResize = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startEl = { ...element };

      const onMove = (ev: MouseEvent) => {
        ev.preventDefault();
        const now = Date.now();
        if (now - lastUpdateRef.current < 16) return;
        lastUpdateRef.current = now;

        let width = startEl.width;
        let height = startEl.height;

        if (direction === "se") {
          width = Math.max(40, startEl.width + (ev.clientX - startX));
          height = Math.max(40, startEl.height + (ev.clientY - startY));
        }

        onUpdateElement({ ...startEl, width, height });
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "nwse-resize";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [element, onUpdateElement]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedElementId(element.id);
    },
    [element.id, setSelectedElementId]
  );

  const handleDoubleClick = useCallback(() => {
    if (element.type === "text") setEditingId(element.id);
  }, [element.type, element.id, setEditingId]);

  const renderShape = (el: any) => {
    const style: React.CSSProperties = {
      width: "100%",
      height: "100%",
      backgroundColor: el.backgroundColor || "transparent",
      borderRadius: el.borderRadius || 0,
      boxShadow: el.boxShadow || "none",
      border: el.border ? `${el.border.width}px solid ${el.border.color}` : "none",
      opacity: el.opacity || 1,
    };

    switch (el.shape) {
      case "circle":
        return <div style={{ ...style, borderRadius: "50%" }} />;
      case "rectangle":
      case "rounded-rectangle":
        return <div style={style} />;
      case "line":
        return <div style={{ ...style, height: el.height || 2, backgroundColor: el.backgroundColor || el.color || "#000" }} />;
      default:
        return <IconImport name={el.shape} size={el.width / 2} color={el.color} />;
    }
  };

  const renderButton = (el: any) => {
    const style: React.CSSProperties = {
      width: "100%",
      height: "100%",
      backgroundColor: el.backgroundColor || "#6366F1",
      color: el.color || "#fff",
      border: "none",
      borderRadius: el.borderRadius || 8,
      fontSize: el.fontSize || 16,
      fontWeight: el.fontWeight || "700",
      fontFamily: el.fontFamily || "Montserrat, sans-serif",
      boxShadow: el.boxShadow || "0 4px 8px rgba(0,0,0,0.2)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      letterSpacing: el.letterSpacing || 0,
    };

    return <button style={style}>{el.content}</button>;
  };

  return (
    <div
      ref={dragRef}
      className={`absolute  ${element.locked ? "cursor-not-allowed" : editingId === element.id ? "cursor-text" : "cursor-move"}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.type === "image" ? element.width : "fit-content",
        height: element.type === "image" ? element.height : element.height,
        backgroundColor: element.backgroundColor || "transparent",
        zIndex: editingId === element.id ? 1000 : element.zIndex || 1,
        opacity: element.opacity || 1,
        willChange: "transform",
        minWidth: element.type === "text" ? 50 : undefined,
        minHeight: element.type === "text" ? 30 : undefined,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={element.locked ? undefined : handleMouseDown}
    >
      {element.type === "text" ? (
        editingId === element.id ? (
            <TextInputWithEditor element={element} updateElement={updateElement} />


        ) : (
          <div
            className="w-full h-full px-1 py-1 whitespace-pre-wrap break-words"
            style={{
              fontSize: element.fontSize,
              fontWeight: element.fontWeight,
              fontStyle: element.fontStyle,
              textAlign: element.textAlign,
              textDecoration: element.textDecoration,
              color: element.color,
              fontFamily: element.fontFamily,
              letterSpacing: element.letterSpacing,
              lineHeight: element.lineHeight,
              cursor: "text",
            }}
            dangerouslySetInnerHTML={{ __html: element.content || "" }}
          />
        )
      ) : element.type === "image" ? (
        <img src={element.content || element.src} alt="" className="w-full h-full object-contain pointer-events-none" style={{ borderRadius: element.borderRadius || 0, opacity: element.opacity || 1, maxWidth: "100%", maxHeight: "100%" }} />
      ) : element.type === "icon" ? (
        <div className="pointer-events-none flex items-center justify-center w-full h-full">
          <IconImport name={element.icon || element.name} size={element.size || element.width} color={element.color} />
        </div>
      ) : element.type === "shape" ? (
        <div className="pointer-events-none">{renderShape(element)}</div>
      ) : element.type === "button" ? (
        <div className="pointer-events-none">{renderButton(element)}</div>
      ) : null}

      {/* Resize handle */}
      {selectedElementId === element.id && !element.locked && (
        <div className="resize-handle absolute right-[-8px] bottom-[-8px] w-4 h-4 bg-blue-600 rounded-full border-2 border-white cursor-nwse-resize z-20" onMouseDown={(e) => handleResize(e, "se")} />
      )}
    </div>
  );
};
  interface SlideEditorProps {
    slide: any;
    onUpdateElement: (el: any) => void;
    selectedElementId: string | number | null;
    setSelectedElementId: (id: string | number | null) => void;
    visibleElements: Array<string | number>;
    isAnimating?: boolean;
  }

  const SlideEditor: React.FC<SlideEditorProps> = React.memo(
    ({
      slide,
      onUpdateElement,
      selectedElementId,
      setSelectedElementId,
      visibleElements,
      isAnimating,
    }) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const [editingId, setEditingId] = useState<string | number | null>(null);

      const handleContainerClick = useCallback(() => {
        setSelectedElementId(null);
        setEditingId(null);
      }, [setSelectedElementId]);

      return (
        <>
          <div
            id={`slide-thumb`}
            ref={containerRef}
            style={{
              width: 800,
              height: 450,
              background: slide?.backgroundColor,
              position: "relative",
              overflow: "hidden",
              margin: "0 auto",
            }}
            onClick={handleContainerClick}
          >
            <AnimatePresence>
              {(slide?.elements || [])?.map((el: any, index: number) => (
                <AnimatedElement
                  key={el.id}
                  element={el}
                  isVisible={visibleElements.includes(el.id)}
                  delay={index * 0.3}
                  onUpdateElement={onUpdateElement}
                  selectedElementId={selectedElementId}
                  setSelectedElementId={setSelectedElementId}
                  editingId={editingId}
                  setEditingId={setEditingId}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      );
    }
  );

  if (!slides) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex-1 bg-gray-100 p-4 overflow-none">
      <div className="w-full h-full relative mx-auto border border-gray-300 shadow-lg bg-white">
        <SlideEditor
          slide={slides[currentSlide]}
          onUpdateElement={updateElement}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          visibleElements={visibleElements}
          isAnimating={isPlaying}
        />
      </div>

      {addline && (
        <div className="absolute top-2 right-2 z-[1010]">
          <AddLine
            currentSVG={currentSVG}
            setCurrentSVG={setCurrentSVG}
            setAddLine={setAddLine}
          />
        </div>
      )}

      <ToolBox
        slides={slides}
        setSlides={setSlides}
        currentSlide={currentSlide}
        setSelectedElementId={setSelectedElementId}
        setVisibleElements={setVisibleElements}
        setActiveEditorBtn={setActiveEditorBtn}
        activeEditorBtn={activeEditorBtn}
        setAddLine={setAddLine}
      />
    </div>
  );
};

export default EditorBox;
