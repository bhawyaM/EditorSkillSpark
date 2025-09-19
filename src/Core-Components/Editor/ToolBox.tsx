import React, {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  Type,
  Star,
  Circle,
  Square,
  Shapes,
  Image as ImageIcon,
  SplinePointer 
} from "lucide-react";
import { type SlideConfig } from "../../assets/types/slidesData";
import useDragable from "../../Hooks/useDragable";
import IconGridInterface from "./IconGridInterface";
import { AnimatePresence, motion } from "framer-motion";

const ToolBox = ({
  slides,
  setSlides,
  currentSlide,
  setSelectedElementId,
  setVisibleElements,
  setActiveEditorBtn,
  activeEditorBtn,
  setAddLine 
}: {
  slides: SlideConfig[];
  setSlides: Dispatch<SetStateAction<SlideConfig[]>>;
  currentSlide: number;
  setSelectedElementId: Dispatch<SetStateAction<string | number | null>>;
  setVisibleElements: Dispatch<SetStateAction<string[]>>;
  setActiveEditorBtn: Dispatch<SetStateAction<number | null>>;
  activeEditorBtn: number | null;
  setAddLine :Dispatch<SetStateAction<boolean>>
}) => {
  const handleToolBox = useDragable();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const [iconBox, setIconBox] = useState<boolean>(false);
  const [iconShape, setIconShape] = useState<string>("");

  const handleImageBtnClick = (idx: number) => {
    setActiveEditorBtn(idx);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const addTextElement = () => {
    const newEl: any = {
      id: `el-${Date.now()}`,
      type: "text",
      content: "Double click to edit",
      x: 120,
      y: 120,
      width: 220,
      height: 50,
      fontSize: 20,
      color: "#333",
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "left",
      textDecoration: "none",
      fontFamily: "Arial",
    };
    const newSlides = [...slides];
    newSlides[currentSlide].elements = newSlides[currentSlide].elements || [];
    newSlides[currentSlide].elements.push(newEl);
    setSlides(newSlides);
    setSelectedElementId(newEl.id);
    setVisibleElements((prev) => [...prev, newEl.id]);
  };

  const addShapeElement = (shape: string) => {
    console.log("Adding shape:", shape);
    const newEl: any = {
      id: `el-${Date.now()}`,
      type: "shape",
      shape,
      x: 180,
      y: 180,
      width: 80,
      height: 80,
      color: "#ff9800",
    };
    const newSlides = [...slides];
    newSlides[currentSlide].elements = newSlides[currentSlide].elements || [];
    newSlides[currentSlide].elements.push(newEl);
    setSlides(newSlides);
    setSelectedElementId(newEl.id);
    setVisibleElements((prev) => [...prev, newEl.id]);
  };

  const addIconElement = (icon: string) => {
    console.log("Adding icon:", icon);
    const newEl: any = {
      id: `el-${Date.now()}`,
      type: "icon",
      icon,
      x: 200,
      y: 200,
      width: 60,
      height: 60,
      color: "#ff9800",
    };
    const newSlides = [...slides];
    newSlides[currentSlide].elements = newSlides[currentSlide].elements || [];
    newSlides[currentSlide].elements.push(newEl);
    setSlides(newSlides);
    setSelectedElementId(newEl.id);
    setVisibleElements((prev) => [...prev, newEl.id]);
  };

  const handleButtonClick = (idx: number, buttonFunction: () => void,e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveEditorBtn(idx);
    buttonFunction();
  };

  const functionAddIcon = useCallback((sentIcon:string) => {
    console.log("Icon received in ToolBox:", sentIcon);
    if (sentIcon) {
      addIconElement(sentIcon);
    }
  }, []);



  const editorBox = [
    {
      icon: <Type className="w-7 h-7" />,
      hoverText: "Insert Text",
      function: () => addTextElement(),
    },
    {
      icon: <SplinePointer className="w-7 h-7" />,
      hoverText: "Insert Lines",
      function: () => setAddLine(true),
    },
    {
      icon: <Shapes className="w-7 h-7" />,
      hoverText: "Insert Icon",
      function: () => {
        setIconBox(true);
      },
    },
    {
      icon: <ImageIcon className="w-7 h-7" />,
      hoverText: "Insert Image",
      function: () => {
        if (fileInputRef.current) fileInputRef.current.click();
      },
    },
  ];

  return (
    <div  style={{ position: "relative" }}>
<AnimatePresence>
  {iconBox && (
    <motion.div
    
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: 300,
        zIndex: 20,
        bottom: 50,
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <IconGridInterface
        setIconShape={setIconShape}
        functionAddIcon={functionAddIcon}
        setIconBox={setIconBox}
        iconBox={iconBox}
        setActiveEditorBtn={setActiveEditorBtn}
      />
    </motion.div>
  )}
</AnimatePresence>
      <div
        onMouseDown={handleToolBox}
        style={{
          position: "absolute",
          alignItems: "center",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "32px", // Increased gap from 20px to 32px
          padding: "12px 20px", // Increased padding for better proportions
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(10px) saturate(120%)",
          borderRadius: "12px", // Slightly increased border radius
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          zIndex: 10,
        }}
      >
        {editorBox.map((btn, idx) => (
          <div
            key={idx}
            onClick={(e) => handleButtonClick(idx, btn.function,e)}
            onMouseEnter={() => setHoveredButton(idx)}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              position: "relative",
              padding: "12px", // Increased padding for larger clickable area
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: activeEditorBtn === idx ? "#1e3a8a" : "transparent",
              borderRadius: "8px", // Increased border radius
              transition: "all 0.2s ease", // Added 'all' for smoother transitions
              color: activeEditorBtn === idx ? "#fff" : "#374151",
              boxShadow: activeEditorBtn === idx ? "0 2px 8px rgba(30, 58, 138, 0.3)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {btn.icon}
            </div>

            {/* Tooltip arrow */}
            <div
              style={{
                width: 10,
                height: 10,
                transform: "translateX(-50%) rotate(45deg)",
                position: "absolute",
                top: -9,
                left: "50%",
                background: "#1e3a8a",
                opacity: hoveredButton === idx ? 1 : 0,
                visibility: hoveredButton === idx ? "visible" : "hidden",
                transition: "opacity 0.2s ease, visibility 0.2s ease",
              }}
            />

            {/* Tooltip */}
            <div
              style={{
                position: "absolute",
                top: -35, // Adjusted for better positioning
                left: "50%",
                transform: "translateX(-50%)",
                background: "#1e3a8a",
                color: "white",
                padding: "6px 10px", // Slightly increased padding
                borderRadius: "6px",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                opacity: hoveredButton === idx ? 1 : 0,
                visibility: hoveredButton === idx ? "visible" : "hidden",
                transition: "opacity 0.2s ease, visibility 0.2s ease",
                zIndex: 1000,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              {btn.hoverText}
            </div>
          </div>
        ))}
      </div>

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          // Handle file upload logic here
          console.log("File selected:", e.target.files?.[0]);
        }}
      />
    </div>
  );
};

export default ToolBox;