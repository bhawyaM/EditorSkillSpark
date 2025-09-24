import React, { useState, useRef, useCallback, useEffect } from "react";
import useDragable from "../Hooks/useDragable";
import { motion, useAnimation } from "framer-motion";
import { 
  Undo2, 
  Redo2, 
  List, 
  CornerDownLeft, 
  MoveHorizontal, 
  Save, 
  GripVertical, 
  ChevronLeft, 
  ChevronRight, 
  Home 
} from "lucide-react";

// Simple debounced callback implementation
function useDebouncedCallback(
  callback: (value: string) => void,
  delay: number
) {
  const timeoutRef = useRef<number | null>(null);

  return useCallback(
    (value: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(value);
      }, delay);
    },
    [callback, delay]
  );
}

interface TextInputWithEditorProps {
  element: {
    content: string;
    fontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: string;
    textDecoration?: string;
    color?: string;
    fontFamily?: string;
    letterSpacing?: string;
    lineHeight?: string;
  };
  updateElement: (element: any) => void;
}

export default function TextInputWithEditor({
  updateElement,
  element,
}: TextInputWithEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [editorContent, setEditorContent] = useState<string>(element?.content || "");
  const [history, setHistory] = useState<string[]>([element?.content || ""]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [activeEditorBtn, setActiveEditorBtn] = useState<number | null>(null);
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const controls = useAnimation();
  const handleToolBox = useDragable();
  
  const handleSaveDebounced = useDebouncedCallback((content) => {
    console.log("Auto-saved:", content);
    // updateElement({ ...element, content });
  }, 500);

  const saveToHistory = useCallback(
    (content: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        if (newHistory[newHistory.length - 1] !== content) {
          newHistory.push(content);
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        }
        return prev;
      });
    },
    [historyIndex]
  );

  const handleEditorInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const content = e.target.value;
      setEditorContent(content);
      handleSaveDebounced(content);
      saveToHistory(content);
    },
    [handleSaveDebounced, saveToHistory]
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousContent = history[newIndex] || "";
      setEditorContent(previousContent);
    }
  }, [canUndo, historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextContent = history[newIndex] || "";
      setEditorContent(nextContent);
    }
  }, [canRedo, historyIndex, history]);

  const insertText = useCallback((textToInsert: string) => {
    if (editorRef.current) {
      const input = editorRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = editorContent;

      const newValue =
        currentValue.substring(0, start) +
        textToInsert +
        currentValue.substring(end);
      
      setEditorContent(newValue);

      // Set cursor position after inserted text
      setTimeout(() => {
        if (input) {
          const newCursorPos = start + textToInsert.length;
          input.setSelectionRange(newCursorPos, newCursorPos);
          input.focus();
        }
      }, 0);

      saveToHistory(newValue);
      handleSaveDebounced(newValue);
    }
  }, [editorContent, saveToHistory, handleSaveDebounced]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "z":
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
        case "y":
          e.preventDefault();
          handleRedo();
          break;
        case "enter":
          e.preventDefault();
          insertText("\n");
          break;
      }
    } else if (e.key === "Enter") {
      // Save current content on Enter
      e.preventDefault();
      updateElement({ ...element, content: editorContent });
      console.log("enter clicked");
    }
  }, [handleRedo, handleUndo, insertText, updateElement, element, editorContent]);

  const handleButtonClick = useCallback((
    idx: number,
    func: () => void,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!isDragging) {
      setActiveEditorBtn(activeEditorBtn === idx ? null : idx);
      func();

      setTimeout(() => {
        setActiveEditorBtn(null);
      }, 300);
    }
  }, [isDragging, activeEditorBtn]);

  // Toolbar drag handlers - Fixed for free movement
  const handleDragStart = () => {
    setIsDragging(true);
    setHoveredButton(null);
  };

  const handleDragEnd = (event: any, info: any) => {
    // Use offset for relative positioning from initial position
    setPosition(prevPos => ({ 
      x: prevPos.x + info.offset.x, 
      y: prevPos.y + info.offset.y 
    }));
    setTimeout(() => setIsDragging(false), 100);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    controls.start({
      width: !isMinimized ? 48 : 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    });
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  // Keyboard navigation for toolbar
  const handleToolbarKeyDown = (e: React.KeyboardEvent, idx: number, func: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleButtonClick(idx, func, e as any);
    }
  };

  // Auto-hide tooltips on scroll or resize
  useEffect(() => {
    const hideTooltips = () => setHoveredButton(null);
    window.addEventListener('scroll', hideTooltips);
    window.addEventListener('resize', hideTooltips);
    
    return () => {
      window.removeEventListener('scroll', hideTooltips);
      window.removeEventListener('resize', hideTooltips);
    };
  }, []);

  // Toolbar buttons configuration
  const ToolBox = [
    {
      icon: <Undo2 size={16} />,
      hoverText: "Undo (Ctrl+Z)",
      function: handleUndo,
      disabled: !canUndo,
    },
    {
      icon: <Redo2 size={16} />,
      hoverText: "Redo (Ctrl+Y)",
      function: handleRedo,
      disabled: !canRedo,
    },
    {
      icon: <List size={16} />,
      hoverText: "Bullet Point",
      function: () => insertText("• "),
      disabled: false,
    },
    {
      icon: <CornerDownLeft size={16} />,
      hoverText: "New Line",
      function: () => insertText("\n"),
      disabled: false,
    },
    {
      icon: <MoveHorizontal size={16} />,
      hoverText: "Tab",
      function: () => insertText("\t"),
      disabled: false,
    },
    {
      icon: <Save size={16} />,
      hoverText: "Save Content",
      function: () => updateElement({ ...element, content: editorContent }),
      disabled: false,
    },
  ];

  return (
    <>
      {/* Editor Content */}
      <div
        onMouseDown={handleToolBox}
        className="bg-transparent relative bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="overflow-hidden">
          <textarea
            ref={editorRef}
            value={editorContent}
            onChange={handleEditorInput}
            autoFocus
            onKeyDown={handleKeyDown}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent w-fit h-fit resize-none"
            style={{
              fontSize: element.fontSize || "16px",
              fontWeight: element.fontWeight || "normal",
              fontStyle: element.fontStyle || "normal",
              textAlign: (element.textAlign as any) || "left",
              textDecoration: element.textDecoration || "none",
              color: element.color || "black",
              fontFamily: element.fontFamily || "inherit",
              letterSpacing: element.letterSpacing || "normal",
              lineHeight: element.lineHeight || "1.5",
            }}
            dir="ltr"
            placeholder="Enter your text here..."
          />
        </div>
      </div>

      {/* Enhanced Draggable Toolbar - Free Movement Anywhere */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={{ 
          x: position.x, 
          y: position.y,
          ...controls ,
          opacity: 1, scale: 1
        }}
        whileDrag={{ 
          scale: 1.08,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          cursor: 'grabbing',
          zIndex: 10000
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          opacity: { duration: 0.3 }
        }}
        className="fixed pointer-events-auto select-none"
        style={{
          top: 100,
          left: 100,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          zIndex: 9999
        }}
      >
        <div className="flex items-center gap-1 p-2 bg-gradient-to-r from-white/30 to-white/10 rounded-xl shadow-2xl border border-white/40 backdrop-blur-xl">
          {/* Drag Handle */}
          <div 
            className="drag-handle cursor-grab active:cursor-grabbing p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 select-none rounded-lg hover:bg-white/50"
            onMouseDown={handleDragStart}
          >
            <GripVertical size={14} />
          </div>

          {/* Minimize/Expand Button */}
          <motion.button
            onClick={toggleMinimize}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-all duration-200"
            title={isMinimized ? 'Expand' : 'Minimize'}
            aria-label={isMinimized ? 'Expand toolbar' : 'Minimize toolbar'}
          >
            {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </motion.button>

          {/* Main Buttons */}
          <motion.div 
            className="flex gap-1"
            animate={{ 
              opacity: isMinimized ? 0 : 1,
              width: isMinimized ? 0 : 'auto',
              overflow: 'hidden'
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {!isMinimized && ToolBox.map((btn, idx) => (
              <motion.button
                key={idx}
                onClick={(e) => !btn.disabled && handleButtonClick(idx, btn.function, e)}
                onMouseEnter={() => !isDragging && setHoveredButton(idx)}
                onMouseLeave={() => setHoveredButton(null)}
                onKeyDown={(e) => handleToolbarKeyDown(e, idx, btn.function)}
                disabled={btn.disabled}
                whileHover={!btn.disabled ? { 
                  scale: 1.05, 
                  y: -2,
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
                } : {}}
                whileTap={!btn.disabled ? { scale: 0.95 } : {}}
                tabIndex={0}
                className={`
                  relative p-2.5 flex items-center justify-center cursor-pointer 
                  w-10 h-10 rounded-lg transition-all duration-200 ease-out
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
                  ${
                    activeEditorBtn === idx
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-2 border-blue-400"
                      : "bg-white/70 text-gray-700 hover:bg-white/90 hover:text-gray-900 border-2 border-transparent"
                  }
                  ${btn.disabled 
                    ? "opacity-40 cursor-not-allowed hover:bg-white/70 hover:text-gray-700" 
                    : "hover:shadow-lg hover:border-gray-200/50"
                  }
                `}
                aria-label={btn.hoverText}
                role="button"
              >
                <motion.div 
                  className="flex items-center justify-center"
                  transition={{ duration: 0.3 }}
                >
                  {btn.icon}
                </motion.div>

                {/* Enhanced Tooltip */}
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ 
                    opacity: hoveredButton === idx && !btn.disabled && !isDragging ? 1 : 0,
                    y: hoveredButton === idx && !btn.disabled && !isDragging ? 0 : 8,
                    scale: hoveredButton === idx && !btn.disabled && !isDragging ? 1 : 0.8
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 pointer-events-none z-50"
                  style={{ zIndex: 10001 }}
                >
                  <div className="bg-gray-900/95 text-white text-sm px-3 py-2 rounded-lg shadow-2xl border border-gray-700 whitespace-nowrap backdrop-blur-sm">
                    {btn.hoverText}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/95 rotate-45 border-r border-b border-gray-700" />
                  </div>
                </motion.div>
              </motion.button>
            ))}
          </motion.div>

          {/* Reset Position Button */}
          <motion.button
            onClick={resetPosition}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50/80 rounded-lg transition-all duration-200"
            title="Reset Position"
            aria-label="Reset toolbar position"
          >
            <Home size={14} />
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}


// import React, { useState, useRef, useCallback, useEffect } from "react";
// import { 
//   Undo2, 
//   Redo2, 
//   Bold, 
//   Italic, 
//   Underline, 
//   AlignLeft, 
//   AlignCenter, 
//   AlignRight, 
//   AlignJustify, 
//   Plus, 
//   Minus, 
//   Palette, 
//   Type,
//   MoreHorizontal,
//   List,
//   CornerDownLeft,
//    IndentIncrease
// } from "lucide-react";
// import useDragable from "../Hooks/useDragable";

// // Simple debounced callback implementation
// function useDebouncedCallback(
//   callback: (value: string) => void,
//   delay: number
// ) {
//   const timeoutRef = useRef<number | null>(null);

//   return useCallback(
//     (value: string) => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//       timeoutRef.current = setTimeout(() => {
//         callback(value);
//       }, delay);
//     },
//     [callback, delay]
//   );
// }

// interface TextInputWithEditorProps {
//   element: {
//     content: string;
//     fontSize?: string;
//     fontWeight?: string;
//     fontStyle?: string;
//     textAlign?: string;
//     textDecoration?: string;
//     color?: string;
//     fontFamily?: string;
//     letterSpacing?: string;
//     lineHeight?: string;
//   };
//   updateElement: (element: any) => void;
// }

// export default function TextInputWithEditor({
//   updateElement,
//   element,
// }: TextInputWithEditorProps) {
//   const editorRef = useRef<HTMLTextAreaElement>(null);
//   const [editorContent, setEditorContent] = useState<string>(element?.content || "");
//   const [history, setHistory] = useState<string[]>([element?.content || ""]);
//   const [historyIndex, setHistoryIndex] = useState<number>(0);
//   const [activeEditorBtn, setActiveEditorBtn] = useState<number | null>(null);
//   const [hoveredButton, setHoveredButton] = useState<number | null>(null);
//   const [showColorPicker, setShowColorPicker] = useState(false);
//   const [showFontSizePicker, setShowFontSizePicker] = useState(false);
//   const [showFontFamilyPicker, setShowFontFamilyPicker] = useState(false);

//   const handleToolBox = useDragable();
  
//   const handleSaveDebounced = useDebouncedCallback((content) => {
//     console.log("Auto-saved:", content);
//     // updateElement({ ...element, content });
//   }, 500);

//   const saveToHistory = useCallback(
//     (content: string) => {
//       setHistory((prev) => {
//         const newHistory = prev.slice(0, historyIndex + 1);
//         if (newHistory[newHistory.length - 1] !== content) {
//           newHistory.push(content);
//           setHistoryIndex(newHistory.length - 1);
//           return newHistory;
//         }
//         return prev;
//       });
//     },
//     [historyIndex]
//   );

//   const handleEditorInput = useCallback(
//     (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//       const content = e.target.value;
//       setEditorContent(content);
//       handleSaveDebounced(content);
//       saveToHistory(content);
//     },
//     [handleSaveDebounced, saveToHistory]
//   );

//   const canUndo = historyIndex > 0;
//   const canRedo = historyIndex < history.length - 1;

//   const handleUndo = useCallback(() => {
//     if (canUndo) {
//       const newIndex = historyIndex - 1;
//       setHistoryIndex(newIndex);
//       const previousContent = history[newIndex] || "";
//       setEditorContent(previousContent);
//     }
//   }, [canUndo, historyIndex, history]);

//   const handleRedo = useCallback(() => {
//     if (canRedo) {
//       const newIndex = historyIndex + 1;
//       setHistoryIndex(newIndex);
//       const nextContent = history[newIndex] || "";
//       setEditorContent(nextContent);
//     }
//   }, [canRedo, historyIndex, history]);

//   const insertText = useCallback((textToInsert: string) => {
//     if (editorRef.current) {
//       const input = editorRef.current;
//       const start = input.selectionStart || 0;
//       const end = input.selectionEnd || 0;
//       const currentValue = editorContent;

//       const newValue =
//         currentValue.substring(0, start) +
//         textToInsert +
//         currentValue.substring(end);
      
//       setEditorContent(newValue);

//       // Set cursor position after inserted text
//       setTimeout(() => {
//         if (input) {
//           const newCursorPos = start + textToInsert.length;
//           input.setSelectionRange(newCursorPos, newCursorPos);
//           input.focus();
//         }
//       }, 0);

//       saveToHistory(newValue);
//       handleSaveDebounced(newValue);
//     }
//   }, [editorContent, saveToHistory, handleSaveDebounced]);

//   // Style update functions
//   const updateStyle = useCallback((styleProperty: string, value: string) => {
//     const updatedElement = { ...element, [styleProperty]: value };
//     updateElement(updatedElement);
//   }, [element, updateElement]);

//   const toggleFontWeight = useCallback(() => {
//     const currentWeight = element.fontWeight || "normal";
//     const newWeight = currentWeight === "bold" ? "normal" : "bold";
//     updateStyle("fontWeight", newWeight);
//   }, [element.fontWeight, updateStyle]);

//   const toggleFontStyle = useCallback(() => {
//     const currentStyle = element.fontStyle || "normal";
//     const newStyle = currentStyle === "italic" ? "normal" : "italic";
//     updateStyle("fontStyle", newStyle);
//   }, [element.fontStyle, updateStyle]);

//   const toggleTextDecoration = useCallback(() => {
//     const currentDecoration = element.textDecoration || "none";
//     const newDecoration = currentDecoration === "underline" ? "none" : "underline";
//     updateStyle("textDecoration", newDecoration);
//   }, [element.textDecoration, updateStyle]);

//   const setTextAlign = useCallback((alignment: string) => {
//     updateStyle("textAlign", alignment);
//   }, [updateStyle]);

//   const increaseFontSize = useCallback(() => {
//     const currentSize = parseInt(element.fontSize || "16");
//     const newSize = Math.min(currentSize + 2, 72);
//     updateStyle("fontSize", `${newSize}px`);
//   }, [element.fontSize, updateStyle]);

//   const decreaseFontSize = useCallback(() => {
//     const currentSize = parseInt(element.fontSize || "16");
//     const newSize = Math.max(currentSize - 2, 8);
//     updateStyle("fontSize", `${newSize}px`);
//   }, [element.fontSize, updateStyle]);

//   const adjustLetterSpacing = useCallback((direction: 'increase' | 'decrease') => {
//     const current = parseFloat(element.letterSpacing || "0");
//     const adjustment = direction === 'increase' ? 0.5 : -0.5;
//     const newSpacing = Math.max(current + adjustment, -2);
//     updateStyle("letterSpacing", `${newSpacing}px`);
//   }, [element.letterSpacing, updateStyle]);

//   const adjustLineHeight = useCallback((direction: 'increase' | 'decrease') => {
//     const current = parseFloat(element.lineHeight || "1.5");
//     const adjustment = direction === 'increase' ? 0.1 : -0.1;
//     const newHeight = Math.max(current + adjustment, 0.8);
//     updateStyle("lineHeight", newHeight.toFixed(1));
//   }, [element.lineHeight, updateStyle]);

//   const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.ctrlKey || e.metaKey) {
//       switch (e.key.toLowerCase()) {
//         case "z":
//           e.preventDefault();
//           if (e.shiftKey) {
//             handleRedo();
//           } else {
//             handleUndo();
//           }
//           break;
//         case "y":
//           e.preventDefault();
//           handleRedo();
//           break;
//         case "b":
//           e.preventDefault();
//           toggleFontWeight();
//           break;
//         case "i":
//           e.preventDefault();
//           toggleFontStyle();
//           break;
//         case "u":
//           e.preventDefault();
//           toggleTextDecoration();
//           break;
//         case "enter":
//           e.preventDefault();
//           insertText("\n");
//           break;
//       }
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       updateElement({ ...element, content: editorContent });
//       console.log("enter clicked");
//     }
//   }, [handleRedo, handleUndo, insertText, toggleFontWeight, toggleFontStyle, toggleTextDecoration, updateElement, element, editorContent]);

//   const handleButtonClick = useCallback((
//     idx: number,
//     func: () => void,
//     e: React.MouseEvent
//   ) => {
//     e.stopPropagation();
//     setActiveEditorBtn(idx);
//     func();

//     setTimeout(() => {
//       setActiveEditorBtn(null);
//     }, 300);
//   }, []);

//   // Font families
//   const fontFamilies = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Impact", "Comic Sans MS"];
  
//   // Font sizes
//   const fontSizes = ["8", "10", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48"];

//   // Toolbar buttons configuration
//   const ToolBox = [
//     // Text editing actions
//     {
//       icon: Undo2,
//       hoverText: "Undo (Ctrl+Z)",
//       function: handleUndo,
//       disabled: !canUndo,
//     },
//     {
//       icon: Redo2,
//       hoverText: "Redo (Ctrl+Y)",
//       function: handleRedo,
//       disabled: !canRedo,
//     },
//     {
//       icon: List,
//       hoverText: "Bullet Point",
//       function: () => insertText("• "),
//     },
//     {
//       icon: CornerDownLeft,
//       hoverText: "New Line",
//       function: () => insertText("\n"),
//     },
//     {
//       icon: IndentIncrease,
//       hoverText: "Tab",
//       function: () => insertText("\t"),
//     },
//     // Font styling
//     {
//       icon: Bold,
//       hoverText: "Bold (Ctrl+B)",
//       function: toggleFontWeight,
//       active: element.fontWeight === "bold",
//     },
//     {
//       icon: Italic,
//       hoverText: "Italic (Ctrl+I)",
//       function: toggleFontStyle,
//       active: element.fontStyle === "italic",
//     },
//     {
//       icon: Underline,
//       hoverText: "Underline (Ctrl+U)",
//       function: toggleTextDecoration,
//       active: element.textDecoration === "underline",
//     },
//     // Text alignment
//     {
//       icon: AlignLeft,
//       hoverText: "Align Left",
//       function: () => setTextAlign("left"),
//       active: (element.textAlign || "left") === "left",
//     },
//     {
//       icon: AlignCenter,
//       hoverText: "Align Center",
//       function: () => setTextAlign("center"),
//       active: element.textAlign === "center",
//     },
//     {
//       icon: AlignRight,
//       hoverText: "Align Right",
//       function: () => setTextAlign("right"),
//       active: element.textAlign === "right",
//     },
//     {
//       icon: AlignJustify,
//       hoverText: "Justify",
//       function: () => setTextAlign("justify"),
//       active: element.textAlign === "justify",
//     },
//     // Font size
//     {
//       icon: Plus,
//       hoverText: "Increase Font Size",
//       function: increaseFontSize,
//     },
//     {
//       icon: Minus,
//       hoverText: "Decrease Font Size",
//       function: decreaseFontSize,
//     },
//     // Letter spacing
//     {
//       icon: MoreHorizontal,
//       hoverText: "Increase Letter Spacing",
//       function: () => adjustLetterSpacing('increase'),
//     },
//     {
//       icon: Minus,
//       hoverText: "Decrease Letter Spacing", 
//       function: () => adjustLetterSpacing('decrease'),
//     },
//     // Line height
//     {
//       icon: Plus,
//       hoverText: "Increase Line Height",
//       function: () => adjustLineHeight('increase'),
//     },
//     {
//       icon: Minus,
//       hoverText: "Decrease Line Height",
//       function: () => adjustLineHeight('decrease'),
//     },
//     // Color picker
//     {
//       icon: Palette,
//       hoverText: "Text Color",
//       function: () => setShowColorPicker(!showColorPicker),
//       dropdown: true,
//     },
//     // Font size picker
//     {
//       icon: Type,
//       hoverText: "Font Size",
//       function: () => setShowFontSizePicker(!showFontSizePicker),
//       dropdown: true,
//     },
//     // Font family picker
//     {
//       icon: Type,
//       hoverText: "Font Family",
//       function: () => setShowFontFamilyPicker(!showFontFamilyPicker),
//       dropdown: true,
//     },
//   ];

//   return (
//     <>
//       {/* Editor Content */}
//       <div
//         onMouseDown={handleToolBox}
//         className="bg-transparent relative top-0 bg-opacity-50 flex items-center justify-center z-50"
//       >
//         <div className="overflow-hidden">
//           <textarea
//             ref={editorRef}
//             value={editorContent}
//             onChange={handleEditorInput}
//             autoFocus
//             onKeyDown={handleKeyDown}
//             className="focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent w-fit h-fit resize-none"
//             style={{
//               fontSize: element.fontSize || "16px",
//               fontWeight: element.fontWeight || "normal",
//               fontStyle: element.fontStyle || "normal",
//               textAlign: (element.textAlign as any) || "left",
//               textDecoration: element.textDecoration || "none",
//               color: element.color || "black",
//               fontFamily: element.fontFamily || "inherit",
//               letterSpacing: element.letterSpacing || "normal",
//               lineHeight: element.lineHeight || "1.5",
//             }}
//             dir="ltr"
//             placeholder="Enter your text here..."
//           />
//         </div>
//       </div>

//       {/* Glassmorphic Toolbar */}
//       <div
//         onMouseDown={handleToolBox}
//         className="flex w-fit gap-1 p-1 px-1 bg-white/60 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 z-50 flex-wrap max-w-md"
//       >
//         {ToolBox.map((btn, idx) => (
//           <div key={idx} className="relative">
//             <button
//               onClick={(e) => !btn.disabled && handleButtonClick(idx, btn.function, e)}
//               onMouseEnter={() => setHoveredButton(idx)}
//               onMouseLeave={() => setHoveredButton(null)}
//               disabled={btn.disabled}
//               className={`
//                 relative p-2 flex items-center justify-center cursor-pointer 
//                 w-8 h-8 rounded transition-all duration-200 ease-in-out text-xs
//                 ${
//                   activeEditorBtn === idx || btn.active
//                     ? "bg-blue-600 text-white shadow-inner"
//                     : "bg-transparent text-black hover:bg-gray-100"
//                 }
//                 ${btn.disabled ? "opacity-40 cursor-not-allowed" : "hover:shadow-sm"}
//                 border border-transparent
//                 ${activeEditorBtn === idx || btn.active ? "border-blue-500" : "hover:border-gray-300"}
//               `}
//               style={btn.style}
//             >
//               <btn.icon size={16} />

//               {/* Tooltip */}
//               <div
//                 className={`
//                   absolute -top-10 left-1/2 transform -translate-x-1/2 p-2 text-md
//                   bg-gray-600 text-white px-3 py-1 rounded border border-gray-500
//                   whitespace-nowrap shadow-md transition-all duration-150 z-[1000]
//                   ${
//                     hoveredButton === idx && !btn.disabled
//                       ? "opacity-100 visible"
//                       : "opacity-0 invisible"
//                   }
//                 `}
//               >
//                 {btn.hoverText}
//                 {/* Tooltip arrow */}
//                 <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-600 rotate-45" />
//               </div>
//             </button>

//             {/* Color Picker Dropdown */}
//             {idx === ToolBox.findIndex(b => b.icon === Palette) && showColorPicker && (
//               <div className="absolute top-10 left-0 bg-white rounded-lg shadow-lg border p-3 z-[1001]">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
//                 <input
//                   type="color"
//                   value={element.color || "#000000"}
//                   onChange={(e) => {
//                     updateStyle("color", e.target.value);
//                   }}
//                   className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
//                 />
//               </div>
//             )}

//             {/* Font Size Picker Dropdown */}
//             {idx === ToolBox.findIndex(b => b.icon === Type && b.hoverText === "Font Size") && showFontSizePicker && (
//               <div className="absolute top-10 left-0 bg-white rounded-lg shadow-lg border p-2 grid grid-cols-3 gap-1 z-[1001] max-h-32 overflow-y-auto">
//                 {fontSizes.map((size) => (
//                   <button
//                     key={size}
//                     className={`px-2 py-1 text-sm hover:bg-blue-100 rounded border ${
//                       element.fontSize === `${size}px` ? "bg-blue-500 text-white" : ""
//                     }`}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       updateStyle("fontSize", `${size}px`);
//                       setShowFontSizePicker(false);
//                     }}
//                   >
//                     {size}px
//                   </button>
//                 ))}
//               </div>
//             )}

//             {/* Font Family Picker Dropdown */}
//             {idx === ToolBox.findIndex(b => b.icon === Type && b.hoverText === "Font Family") && showFontFamilyPicker && (
//               <div className="absolute top-10 left-0 bg-white rounded-lg shadow-lg border p-2 w-48 z-[1001] max-h-48 overflow-y-auto">
//                 {fontFamilies.map((font) => (
//                   <button
//                     key={font}
//                     className={`block w-full text-left px-2 py-1 text-sm hover:bg-blue-100 rounded ${
//                       element.fontFamily === font ? "bg-blue-500 text-white" : ""
//                     }`}
//                     style={{ fontFamily: font }}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       updateStyle("fontFamily", font);
//                       setShowFontFamilyPicker(false);
//                     }}
//                   >
//                     {font}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </>
//   );
// }