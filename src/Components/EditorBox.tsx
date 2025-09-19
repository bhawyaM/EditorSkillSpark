import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { type SlideConfig } from "../assets/types/slidesData";
import { IconImport } from "./IconImport";
import ToolBox from "../Core-Components/Editor/ToolBox";
import AddLine from "../Core-Components/Editor/AddLine";
import { s } from "framer-motion/client";

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
  const [selectedElementId, setSelectedElementId] = useState<
    string | number | null
  >(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEditorBtn, setActiveEditorBtn] = useState<number | null>(null);
  const [addline, setAddLine] = useState<boolean>(false);
  // Optimize state updates with useCallback
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
    [currentSlide]
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

          // Use transform for immediate visual feedback
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
            const newX = Math.max(0, initialPositionRef.current.x + deltaX);
            const newY = Math.max(0, initialPositionRef.current.y + deltaY);

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

            // Reset transform and update final position
            if (dragElement) {
              dragElement.style.transform = "";
              dragElement.style.transition = "";
              dragElement.style.zIndex = "";
            }

            // Only update state once at the end
            onUpdateElement({
              ...el,
              x: newX,
              y: newY,
            });

            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
          };

          // Prevent text selection during drag
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
            width: element.width,
            height: element.height,
            backgroundColor: element.backgroundColor || "transparent",
            willChange: "transform", // Optimize for transforms
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
                className="w-full h-full bg-transparent text-black px-2 text-base font-normal font-sans"
                style={{
                  fontSize: element.fontSize || 16,
                  fontWeight: element.fontWeight || "normal",
                  fontStyle: element.fontStyle || "normal",
                  textAlign: element.textAlign || "left",
                  textDecoration: element.textDecoration || "none",
                  color: element.color || "#000",
                  fontFamily: element.fontFamily || "Arial",
                }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center px-2 cursor-text bg-transparent text-black text-base font-normal font-sans"
                style={{
                  fontSize: element.fontSize || 16,
                  fontWeight: element.fontWeight || "normal",
                  fontStyle: element.fontStyle || "normal",
                  textAlign: element.textAlign || "left",
                  textDecoration: element.textDecoration || "none",
                  color: element.color || "#000",
                  fontFamily: element.fontFamily || "Arial",
                }}
              >
                {element.content}
              </div>
            )
          ) : element.type === "image" ? (
            <img
              src={element.content || element.src}
              alt=""
              className="w-full h-full object-cover rounded pointer-events-none"
              style={{ borderRadius: element.borderRadius || 0 }}
              draggable={false}
            />
          ) : element.type === "icon" ? (
            <div className="pointer-events-none">
              <IconImport
                name={typeof element.icon === "string" ? element.icon : ""}
                size={element.width}
                color={element.color}
              />
            </div>
          ) : element.type === "shape" ? (
            <div className="pointer-events-none">
              <IconImport
                name={typeof element.shape === "string" ? element.shape : ""}
                size={element.width / 2}
                color={element.color}
              />
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
          <AddLine setAddLine={setAddLine} />
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
