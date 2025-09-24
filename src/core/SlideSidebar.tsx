import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlideThumbnail from "./SlideThumbnail";
import type {SlideConfig as SlideType  } from "../assets/types/slidesData";
import {ReactSortable} from "react-sortablejs"
import {
  LayoutGrid,
  TableOfContents,
  Plus,
  Trash2,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react";
 
type SlideSidebarProps = {
  slides: SlideType[];
  setSlides: React.Dispatch<React.SetStateAction<SlideType[]>>;
  currentSlide: number;
  setCurrentSlide: (idx: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (idx: number) => void;
  addSlideAt: (idx: number) => void;
  index: number;
  totalSlides: number;
  isPlaying: boolean;
};
 
const SlideSidebar: React.FC<SlideSidebarProps> = ({
  slides,
  setSlides,
  currentSlide,
  isPlaying,
  setCurrentSlide,
  onAddSlide,
  onDeleteSlide,
  addSlideAt,
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(280); // Reduced from 300
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"slides" | "outline">("slides");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
 
  // Reduced responsive width presets
  const getResponsiveWidth = () => {
    if (typeof window === "undefined") return 280;
   
    const width = window.innerWidth;
    if (width < 768) return 260;   // Mobile
    if (width < 1024) return 280;  // Tablet
    if (width < 1280) return 300;  // Laptop
    return 320;                    // Desktop (reduced from 400)
  };
 
  // Auto-adjust sidebar width on resize
  useEffect(() => {
    const handleResize = () => {
      if (!isResizing) {
        setSidebarWidth(getResponsiveWidth());
      }
    };
   
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isResizing]);
 
  // Improved resize logic with tighter constraints
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;
     
      const deltaX = e.clientX - resizeStartX.current;
      const newWidth = resizeStartWidth.current + deltaX;
     
      // Tighter constraints
      const minWidth = 240;  // Reduced from 300
      const maxWidth = Math.min(350, window.innerWidth * 0.6); // Reduced max
     
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };
 
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
 
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
 
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);
 
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = sidebarWidth;
    setIsResizing(true);
  };
 
  // Calculate thumbnail container width with smaller margins
  const getThumbnailWidth = () => {
    const basePadding = 16; // Reduced from 24
    return Math.max(200, sidebarWidth - basePadding); // Smaller minimum
  };
 
  // Animation variants
  const sidebarVariants = {
    collapsed: { width: 50, opacity: 0.95 }, // Reduced collapsed width
    expanded: { width: sidebarWidth, opacity: 1 },
  };
 
  const contentVariants = {
    hidden: { opacity: 0, x: -15 }, // Smaller animation
    visible: { opacity: 1, x: 0 },
  };
 
  if (isCollapsed) {
    return (
      <motion.div
        initial={false}
        animate="collapsed"
        variants={sidebarVariants}
        className="bg-gradient-to-br from-blue-50/90 via-white/90 to-purple-50/90 backdrop-blur-xl h-full flex flex-col border-r border-gray-200/50 relative rounded-r-2xl shadow-xl" // Smaller rounded
      >
        {/* Collapsed Navigation - Compact */}
        <div className="p-2 space-y-3"> {/* Reduced padding */}
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300" // Smaller button
          >
            <ChevronRight size={16} /> {/* Smaller icon */}
          </button>
         
          <div className="space-y-1"> {/* Tighter spacing */}
            <button
              onClick={() => setActiveTab("slides")}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                activeTab === "slides"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white/80 text-gray-600 hover:bg-white"
              }`}
            >
              <LayoutGrid size={14} /> {/* Smaller icon */}
            </button>
           
            <button
              onClick={() => setActiveTab("outline")}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                activeTab === "outline"
                  ? "bg-purple-500 text-white shadow-md"
                  : "bg-white/80 text-gray-600 hover:bg-white"
              }`}
            >
              <TableOfContents size={14} /> {/* Smaller icon */}
            </button>
          </div>
        </div>
 
        {/* Quick Actions - Compact */}
        <div className="mt-auto p-2 space-y-1"> {/* Reduced padding */}
          <button
            onClick={onAddSlide}
            className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-400 to-emerald-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-all duration-300"
            title="Add Slide"
          >
            <Plus size={14} /> {/* Smaller icon */}
          </button>
         
          {slides.length > 0 && (
            <button
              onClick={() => onDeleteSlide(currentSlide)}
              className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-400 to-pink-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-all duration-300"
              title="Delete Slide"
            >
              <Trash2 size={14} /> {/* Smaller icon */}
            </button>
          )}
        </div>
      </motion.div>
    );
  }
 
  return (
    <motion.div
      ref={sidebarRef}
      initial={false}
      animate="expanded"
      variants={sidebarVariants}
      className="bg-gradient-to-br from-blue-50/90 via-white/90 to-purple-50/90 backdrop-blur-xl h-full flex flex-col border-r border-gray-200/50 relative rounded-r-2xl shadow-xl" // Smaller rounded
      style={{ width: sidebarWidth }}
    >
      {/* Compact Resize Handle */}
      <div
        className="absolute top-0 right-0 w-3 h-full cursor-col-resize group z-20 flex justify-center" // Narrower handle
        onMouseDown={startResizing}
      >
        <div className="w-1 h-full bg-gradient-to-b from-blue-300/30 to-purple-300/30 group-hover:from-blue-400/50 group-hover:to-purple-400/50 transition-all duration-300" />
      </div>
 
      {/* Compact Navigation Tabs */}
      <div className="p-2 pb-1"> {/* Reduced padding */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={contentVariants}
          className="flex bg-white/80 rounded-xl p-1 shadow-inner" // Smaller rounded
        >
          <button
            onClick={() => setActiveTab("slides")}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
              activeTab === "slides"
                ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
                : "text-blue-600 hover:text-blue-800 hover:bg-white"
            }`}
          >
            <LayoutGrid size={14} /> {/* Smaller icon */}
            <span className="truncate text-xs">{slides.length} {slides.length === 1 ? 'Slide' : 'Slides'}</span>
          </button>
 
          <button
            onClick={() => setActiveTab("outline")}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
              activeTab === "outline"
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                : "text-purple-600 hover:text-purple-800 hover:bg-white"
            }`}
          >
            <TableOfContents size={14} /> {/* Smaller icon */}
            <span className="truncate text-xs">Outline</span>
          </button>
         
          <button
            onClick={() => setIsCollapsed(true)}
            className="px-2 rounded-lg bg-white/80 hover:bg-white text-gray-600 transition-all duration-300 shadow-sm hover:shadow-md ml-1"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={14} /> {/* Smaller icon */}
          </button>
        </motion.div>
      </div>
 
      {/* Compact Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === "slides" ? (
            <motion.div
              key="slides"
              initial={{ opacity: 0, y: 15 }} // Smaller animation
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full flex flex-col"
            >
              {/* Compact Slides List */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 custom-scrollbar"> {/* Reduced padding */}
                <ReactSortable
                  list={slides}
                  setList={setSlides}
                  animation={200} // Faster animation
                  handle=".drag-handle"
                  ghostClass="opacity-50"
                  chosenClass="scale-105"
                  dragClass="rotate-3" // Less rotation
                >
                  {slides.map((slide, idx) => (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, scale: 0.98 }} // Smaller scale
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }} // Faster stagger
                      className="relative group mb-2 flex justify-center" // Smaller margin
                    >
                      <div className="w-full flex justify-center">
                        <SlideThumbnail
                          slide={slide}
                          isActive={idx === currentSlide}
                          index={idx}
                          onClick={() => setCurrentSlide(idx)}
                          containerWidth={getThumbnailWidth()}
                          onAddBelow={() => addSlideAt(idx + 1)}
                        />
                      </div>
                     
                      {/* Compact Drag Handle */}
                      <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drag-handle cursor-grab active:cursor-grabbing z-10">
                        <GripVertical size={12} className="text-gray-500 hover:text-gray-700" /> {/* Smaller icon */}
                      </div>
                    </motion.div>
                  ))}
                </ReactSortable>
               
                {slides.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-gray-500 px-2" // Reduced padding
                  >
                    <Zap size={32} className="mx-auto mb-2 text-yellow-500 opacity-50" /> {/* Smaller icon */}
                    <p className="text-sm font-semibold mb-1">No Slides Yet</p> {/* Smaller text */}
                    <p className="text-xs">Create your first slide to get started</p> {/* Smaller text */}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="outline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full flex flex-col"
            >
              {/* Compact Outline Content */}
              <div className="flex-1 overflow-y-auto px-2 py-2"> {/* Reduced padding */}
                <div className="bg-white/80 rounded-xl p-3 shadow-inner"> {/* Smaller rounded, reduced padding */}
                  <h3 className="font-bold text-base mb-2 text-purple-700">Presentation Outline</h3> {/* Smaller text */}
                  <div className="space-y-1"> {/* Tighter spacing */}
                    {slides.map((slide, idx) => (
                      <div
                        key={slide.id}
                        className={`p-2 rounded-lg cursor-pointer transition-all duration-300 text-sm ${
                          idx === currentSlide
                            ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md transform scale-105"
                            : "bg-gray-50/80 hover:bg-white/90 text-gray-700 hover:scale-102"
                        }`}
                        onClick={() => setCurrentSlide(idx)}
                      >
                        <div className="flex items-center gap-2"> {/* Tighter gap */}
                          <span className={`font-bold text-xs min-w-[20px] ${
                            idx === currentSlide ? "text-white" : "text-purple-600"
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="flex-1 text-xs truncate"> {/* Smaller text */}
                            {slide.title || `Slide ${idx + 1}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
 
      {/* Compact Footer */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={contentVariants}
        className="p-2 border-t border-gray-200/50 bg-white/50" // Reduced padding
      >
        <div className="flex items-center justify-between mb-2"> {/* Reduced margin */}
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap"> {/* Smaller text */}
            Slide {currentSlide + 1} of {slides.length}
          </span>
         
          <div className="flex items-center gap-1"> {/* Tighter gap */}
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="p-1 rounded-md  text-blue-950 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/50 transition-colors" // Smaller padding
              title="Previous Slide"
            >
              <ChevronLeft size={12} /> {/* Smaller icon */}
            </button>
           
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-1 rounded-md  text-blue-950 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/50 transition-colors"
              title="Next Slide"
            >
              <ChevronRight size={12} /> {/* Smaller icon */}
            </button>
          </div>
        </div>
 
        <div className="grid grid-cols-2 gap-1"> {/* Tighter gap */}
          <button
            onClick={onAddSlide}
            className="flex items-center justify-center gap-1 py-1.5 bg-gradient-to-r from-green-400 to-emerald-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 text-xs" // Smaller padding and text
          >
            <Plus size={12} /> {/* Smaller icon */}
            <span>Add Slide</span>
          </button>
         
          {slides.length > 0 && (
            <button
              onClick={() => onDeleteSlide(currentSlide)}
              className="flex items-center justify-center gap-1 py-1.5 bg-gradient-to-r from-red-400 to-pink-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 text-xs"
            >
              <Trash2 size={11} /> {/* Smaller icon */}
              <span>Delete</span>
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
 
export default SlideSidebar;