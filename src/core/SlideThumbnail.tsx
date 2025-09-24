import React, { useState } from "react";
import type {SlideConfig as SlideType  } from "../assets/types/slidesData";
import { Plus } from "lucide-react";
 
type SlideThumbnailProps = {
  slide: SlideType;
  isActive: boolean;
  onClick: () => void;
  index: number;
  containerWidth: number;
  onAddBelow?: () => void; // Add this prop for the add button functionality
};
 
const SlideThumbnail: React.FC<SlideThumbnailProps> = ({
  slide,
  isActive,
  onClick,
  index,
  containerWidth,
  onAddBelow
}) => {
  // Calculate aspect ratio (assuming 16:9 slides)
 
  const aspectRatio = 16 / 9;
  // Responsive width: fallback to 100% if not provided
  const thumbnailWidth = containerWidth || 180;
  const thumbnailHeight = thumbnailWidth / aspectRatio;
 
  // Calculate scale factor to fit elements within thumbnail
  const scaleFactor = thumbnailWidth / 900; // Assuming original slide width is 800px
 
  const [hovered, setHovered] = useState(false);
 
  return (
    <div
      onClick={onClick}
      className={`relative border rounded-md overflow-hidden cursor-pointer mb-2 transition-all duration-300
        w-full max-w-[180px] sm:max-w-[220px] md:max-w-[260px] lg:max-w-[320px]
        aspect-[16/9]
        ${isActive
          ? "border-blue-500 ring-2 ring-blue-400 shadow-lg"
          : "border-gray-300 hover:border-blue-300 hover:shadow-md"}
      `}
      style={{
        width: thumbnailWidth,
        height: thumbnailHeight,
        backgroundColor: slide.backgroundColor
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Render slide elements */}
      {slide.elements.map((el: any) => {
        const baseStyle: React.CSSProperties = {
          position: "absolute",
          left: el.x * scaleFactor,
          top: el.y * scaleFactor,
          width: el.width * scaleFactor,
          height: el.height * scaleFactor,
          overflow: "hidden",
        };
 
        if (el.type === "text") {
          return (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translate(${el.x * scaleFactor}px, ${el.y * scaleFactor}px) scale(${scaleFactor})`,
                transformOrigin: 'top left',
                width: el.width,
                height: el.height,
                overflow: "hidden",
                fontSize: el.fontSize || 12,
                fontWeight: el.fontWeight || "normal",
                fontFamily: el.fontFamily || "Arial",
                textAlign: (el.textAlign as any) || "left",
                color: el.color || slide.textColor,
              }}
              className="flex items-center justify-center"
            >
              {el.content}
            </div>
          );
        }
 
        if (el.type === "image") {
          return (
            <img
              key={el.id}
              src={el.src}
              alt=""
              style={{
                ...baseStyle,
                objectFit: "cover",
              }}
            />
          );
        }
 
        if (el.type === "shape") {
          if (el.shape === "circle") {
            return (
              <div
                key={el.id}
                style={{
                  ...baseStyle,
                  borderRadius: "50%",
                  backgroundColor: el.backgroundColor || "#555",
                }}
              />
            );
          }
          if (el.shape === "square" || el.shape === "rectangle") {
            return (
              <div
                key={el.id}
                style={{
                  ...baseStyle,
                  backgroundColor: el.backgroundColor || "#555",
                }}
              />
            );
          }
        }
 
        return null;
      })}
 
      {/* Overlay: slide title */}
      <div
        className="absolute top-2 left-0 text-white text-[10px] sm:text-[11px] md:text-xs font-medium flex items-center justify-between px-1 sm:px-2 py-1 rounded-b-md backdrop-blur-sm w-full"
      >
        {/* Slide Number Badge */}
        <span
          className="flex absolute items-center justify-center w-5 h-6 rounded-sm text-white font-extrabold text-base sm:text-xl shadow-md"
        >
          {index + 1}
        </span>
        {/* Slide Title (optional) */}
        {/* <span className="truncate flex-1 ml-2 text-xs sm:text-md">{slide.title || "Untitled"}</span> */}
      </div>
 
     
      {/* Creative + button that appears on hover */}
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddBelow && onAddBelow();
          }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 sm:px-8 md:px-10 rounded-full flex items-center justify-center bg-white text-blue-600 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 z-20 text-xs sm:text-sm"
        >
          <Plus size={16} className="drop-shadow-sm" />
        </button>
      )}
 
 
    </div>
  );
};
 
export default SlideThumbnail;
 
 