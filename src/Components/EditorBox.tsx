import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { type SlideConfig } from "../assets/types/slidesData";
import { IconImport } from "./IconImport";
import ToolBox from "../Core-Components/Editor/ToolBox";
import AddLine from "../Core-Components/Editor/AddLine";

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
  const [savedSVGs, setSavedSVGs] = useState<SavedSVG[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<
    string | number | null
  >(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEditorBtn, setActiveEditorBtn] = useState<number | null>(null);
  const [addline, setAddLine] = useState<boolean>(false);
  
  // Track processed SVGs to avoid duplicates
  const processedSVGsRef = useRef<Set<string>>(new Set());

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

      // Create SVG with proper viewBox based on content
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
        width: 300, // Increased width
        height: 200, // Reasonable height
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

  // Watch for changes in savedSVGs and add new ones to slide
  useEffect(() => {
    if (savedSVGs.length > 0) {
      const latestSVG = savedSVGs[savedSVGs.length - 1];
      
      // Check if this SVG has already been processed
      if (!processedSVGsRef.current.has(latestSVG.id)) {
        // Check if this SVG is already added to slide to avoid duplicates
        const existingElement = slides[currentSlide]?.elements?.find(
          (el: any) => el.id === `svg-img-${latestSVG.id}`
        );

        if (!existingElement) {
          addSVGToSlide(latestSVG);
          processedSVGsRef.current.add(latestSVG.id);
        }
      }
    }
  }, [savedSVGs, addSVGToSlide, currentSlide, slides]);

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

  const AnimatedElement: React.FC<AnimatedElementProps> = React.memo(
    ({
      element,
      isVisible,
      delay = 0,
      onUpdateElement,
      selectedElementId,
      setSelectedElementId,
      editingId,
      setEditingId,
    }) => {
      const isDraggingRef = useRef(false);
      const dragElementRef = useRef<HTMLDivElement>(null);
      const initialPositionRef = useRef({ x: 0, y: 0 });
      const lastUpdateRef = useRef<number>(0);

      const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>, el: any) => {
          if ((e.target as HTMLElement).classList.contains("resize-handle"))
            return;

          e.preventDefault();
          e.stopPropagation();

          isDraggingRef.current = true;
          const startX = e.clientX;
          const startY = e.clientY;
          initialPositionRef.current = { x: el.x, y: el.y };

          const dragElement = dragElementRef.current;
          if (dragElement) {
            dragElement.style.transition = "none";
            dragElement.style.zIndex = "1000";
          }

          const handleMouseMove = (ev: MouseEvent) => {
            if (!isDraggingRef.current) return;
            ev.preventDefault();

            const deltaX = ev.clientX - startX;
            const deltaY = ev.clientY - startY;

            // Only update visual position during drag, don't call onUpdateElement
            if (dragElement) {
              dragElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            }
          };

          const handleMouseUp = (ev: MouseEvent) => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;

            const deltaX = ev.clientX - startX;
            const deltaY = ev.clientY - startY;
            const newX = Math.max(0, initialPositionRef.current.x + deltaX);
            const newY = Math.max(0, initialPositionRef.current.y + deltaY);

            // Reset visual styles
            if (dragElement) {
              dragElement.style.transform = "";
              dragElement.style.transition = "";
              dragElement.style.zIndex = "";
            }

            // Only update the element coordinates when mouse is released
            onUpdateElement({
              ...el,
              x: newX,
              y: newY,
            });

            // Clean up event listeners and body styles
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
          };

          document.body.style.userSelect = "none";
          document.body.style.cursor = "move";
          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        },
        [onUpdateElement]
      );

      const handleResize = useCallback(
        (e: any, el: any, direction: any) => {
          e.stopPropagation();
          e.preventDefault();

          const startX = e.clientX;
          const startY = e.clientY;
          const startEl = { ...el };

          const handleMouseMove = (ev: any) => {
            ev.preventDefault();
            
            // Throttle resize updates
            const now = Date.now();
            if (now - lastUpdateRef.current < 16) return; // ~60fps
            lastUpdateRef.current = now;

            let width = startEl.width;
            let height = startEl.height;

            if (direction === "se") {
              width = Math.max(40, startEl.width + (ev.clientX - startX));
              height = Math.max(40, startEl.height + (ev.clientY - startY));
            }

            onUpdateElement({ ...startEl, width, height });
          };

          const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
          };

          document.body.style.userSelect = "none";
          document.body.style.cursor = "nwse-resize";
          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        },
        [onUpdateElement]
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

      // Helper function to render shapes
      const renderShape = (element: any) => {
        const shapeStyle: React.CSSProperties = {
          width: "100%",
          height: "100%",
          backgroundColor: element.backgroundColor || "transparent",
          borderRadius: element.borderRadius || 0,
          boxShadow: element.boxShadow || "none",
          border: element.border ? `${element.border.width}px solid ${element.border.color}` : "none",
          opacity: element.opacity || 1,
        };

        switch (element.shape) {
          case "circle":
            return <div style={{ ...shapeStyle, borderRadius: "50%" }} />;
          case "rectangle":
          case "rounded-rectangle":
            return <div style={shapeStyle} />;
          case "line":
            return (
              <div
                style={{
                  ...shapeStyle,
                  height: element.height || 2,
                  backgroundColor: element.backgroundColor || element.color || "#000",
                }}
              />
            );
          default:
            return (
              <IconImport
                name={typeof element.shape === "string" ? element.shape : ""}
                size={element.width / 2}
                color={element.color}
              />
            );
        }
      };

      // Helper function to render buttons
      const renderButton = (element: any) => {
        const buttonStyle: React.CSSProperties = {
          width: "100%",
          height: "100%",
          backgroundColor: element.backgroundColor || "#6366F1",
          color: element.color || "#FFFFFF",
          border: "none",
          borderRadius: element.borderRadius || 8,
          fontSize: element.fontSize || 16,
          fontWeight: element.fontWeight || "700",
          fontFamily: element.fontFamily || "'Montserrat', sans-serif",
          boxShadow: element.boxShadow || "0 4px 8px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          letterSpacing: element.letterSpacing || 0,
        };

        return (
          <button
            style={buttonStyle}
            onMouseEnter={(e) => {
              if (element.hoverEffect) {
                Object.assign(e.currentTarget.style, element.hoverEffect);
              }
            }}
            onMouseLeave={(e) => {
              if (element.hoverEffect) {
                e.currentTarget.style.backgroundColor = element.backgroundColor || "#6366F1";
                e.currentTarget.style.boxShadow = element.boxShadow || "0 4px 8px rgba(0, 0, 0, 0.2)";
              }
            }}
          >
            {element.content}
          </button>
        );
      };

      return (
        <div
          ref={dragElementRef}
          key={element.id}
          className={`absolute ${
            selectedElementId === element.id
              ? "border-2 border-blue-600 shadow-lg z-10"
              : "border border-transparent z-1"
          } ${
            element.locked ? "cursor-not-allowed" : "cursor-move"
          } bg-transparent`}
          style={{
            left: element.x,
            top: element.y,
            width: element.type === "image" ? element.width : "fit-content",
            height: element.type === "image" ? element.height : element.height,
            backgroundColor: element.backgroundColor || "transparent",
            zIndex: element.zIndex || 1,
            opacity: element.opacity || 1,
            willChange: "transform",
          }}
          onMouseDown={
            element.locked ? undefined : (e) => handleMouseDown(e, element)
          }
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          {element.type === "text" ? (
            editingId === element.id ? (
              <input
                value={element.content}
                onChange={(e) =>
                  onUpdateElement({ ...element, content: e.target.value })
                }
                className="w-full h-full bg-transparent px-2"
                style={{
                  fontSize: element.fontSize || 16,
                  fontWeight: element.fontWeight || "normal",
                  fontStyle: element.fontStyle || "normal",
                  textAlign: element.textAlign || "left",
                  textDecoration: element.textDecoration || "none",
                  color: element.color || "#000",
                  fontFamily: element.fontFamily || "Arial",
                  letterSpacing: element.letterSpacing || 0,
                  lineHeight: element.lineHeight || 1.2,
                  border: "none",
                  outline: "none",
                }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center px-2 cursor-text"
                style={{
                  fontSize: element.fontSize || 16,
                  fontWeight: element.fontWeight || "normal",
                  fontStyle: element.fontStyle || "normal",
                  textAlign: element.textAlign || "left",
                  textDecoration: element.textDecoration || "none",
                  color: element.color || "#000",
                  fontFamily: element.fontFamily || "Arial",
                  letterSpacing: element.letterSpacing || 0,
                  lineHeight: element.lineHeight || 1.2,
                  alignItems: element.textAlign === "center" ? "center" : "flex-start",
                  justifyContent: element.textAlign === "center" ? "center" : "flex-start",
                }}
              >
                {element.content}
              </div>
            )
          ) : element.type === "image" ? (
            <img
              src={element.content || element.src}
              alt=""
              className="w-full h-full object-contain pointer-events-none"
              style={{ 
                borderRadius: element.borderRadius || 0,
                opacity: element.opacity || 1,
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          ) : element.type === "icon" ? (
            <div className="pointer-events-none flex items-center justify-center w-full h-full">
              <IconImport
                name={typeof element.icon === "string" ? element.icon : element.name || ""}
                size={element.size || element.width}
                color={element.color}
              />
            </div>
          ) : element.type === "shape" ? (
            <div className="pointer-events-none">
              {renderShape(element)}
            </div>
          ) : element.type === "button" ? (
            <div className="pointer-events-none">
              {renderButton(element)}
            </div>
          ) : null}

          {selectedElementId === element.id && !element.locked && (
            <div
              className="resize-handle absolute right-[-8px] bottom-[-8px] w-4 h-4 bg-blue-600 rounded-full border-2 border-white cursor-nwse-resize z-20"
              onMouseDown={(e) => handleResize(e, element, "se")}
            />
          )}
        </div>
      );
    }
  );

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
      <div className="w-fit h-fit relative mx-auto border border-gray-300 shadow-lg bg-white">
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
        <div className="absolute top-2 right-2 z-10">
          <AddLine
            savedSVGs={savedSVGs}
            setSavedSVGs={setSavedSVGs}
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