// import React, { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import SlideThumbnail from "./SlideThumbnail";
// import type { SlideConfig } from "../assets/types/slidesData";
// // import "../App.css"; 

// type SlideSidebarProps = {
//   slides: SlideConfig[];
//   setSlides: React.Dispatch<React.SetStateAction<SlideConfig[]>>;
//   currentSlide: number;
//   setCurrentSlide: (idx: number) => void;
//   isPlaying: boolean;
//   onAddSlide: () => void;
//   onDeleteSlide: (idx: number) => void;
//   addSlideAt: (idx: number) => void;
// };

// const SlideSidebar: React.FC<SlideSidebarProps> = ({
//   slides,
//   currentSlide,
//   setCurrentSlide,
//   onAddSlide,
//   onDeleteSlide,
//   addSlideAt,
// }) => {
//   const [sidebarWidth, setSidebarWidth] = useState(350);
//   const [isResizing, setIsResizing] = useState(false);
//   const sidebarRef = useRef<HTMLDivElement>(null);

//   // toggle state
//   const [activeTab, setActiveTab] = useState<"slides" | "outlet">("slides");

  

  

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       if (!isResizing) return;
//       if (sidebarRef.current) {
//         const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
//         if (newWidth >= 300 && newWidth <= 450) {
//           setSidebarWidth(newWidth);
//         }
//       }
//     };

//     const handleMouseUp = () => {
//       setIsResizing(false);
//     };

//     if (isResizing) {
//       document.addEventListener("mousemove", handleMouseMove);
//       document.addEventListener("mouseup", handleMouseUp);
//     }

//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [isResizing]);

//   return (
//     <div
//       ref={sidebarRef}
//       className="bg-gray-200 h-full overflow-y-auto flex flex-col border-r border-gray-300 relative custom-scrollbar"
//       style={{ width: `${sidebarWidth}px` }}
//     >
//       {/* Resize handle */}
//       <div
//         className="absolute top-0 right-0 w-1 h-full cursor-col-resize  z-20"
//         onMouseDown={(e) => {
//           e.preventDefault();
//           setIsResizing(true);
//         }}
//       />

//       {/* Toggle buttons */}
//       <div className="flex w-full bg-white  p-2  shadow-md border border-gray-100">
//         <button
//           onClick={() => setActiveTab("slides")}
//           className={`flex-1 text-sm text-center py-2 rounded-full transition-all duration-300 ${
//             activeTab === "slides"
//               ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
//               : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
//           }`}
//         >
//           Slides
//         </button>
//         <button
//           onClick={() => setActiveTab("outlet")}
//           className={`flex-1 text-sm text-center py-2 rounded-full transition-all duration-300 ${
//             activeTab === "outlet"
//               ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
//               : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
//           }`}
//         >
//           Outlet
//         </button>
//       </div>



//       {/* Slides Content */}
//       {activeTab === "slides" && (
//         <>
//           <div className="flex justify-between items-center p-2 sticky top-10 z-10">
//             <button
//               onClick={onAddSlide}
//               className="px-2 py-1 bg-blue-500 text-blue text-xs rounded "
//             >
//               + Add
//             </button>
//             {slides.length > 0 && (
//               <button
//                 onClick={() => onDeleteSlide(currentSlide)}
//                 className="px-2 py-1 bg-red-500 text-blue text-xs rounded "
//               >
//                 Delete
//               </button>
//             )}
//           </div>

//           <div className="flex flex-col gap-2 p-2">
//             {slides.map((slide, idx) => (
//               <SlideThumbnail
//                 key={slide.id}
//                 slide={slide}
//                 isActive={idx === currentSlide}
//                 onClick={() => setCurrentSlide(idx)}
//                 containerWidth={sidebarWidth - 34}
//                 onAddBelow={() => addSlideAt(idx + 0)}
//               />
//             ))}
//           </div>
//         </>
//       )}

//       {/* Outlet Content */}
//       {activeTab === "outlet" && (
//         <div className="p-4 text-sm text-gray-700">
//           {/* Replace with <Outlet /> if you are using react-router */}
//           <p>Outlet Content Goes Here</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SlideSidebar;

