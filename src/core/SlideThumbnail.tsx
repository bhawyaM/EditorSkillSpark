import React, { useState } from "react";
import type {  SlideConfig as SlideType } from "../assets/types/slidesData";
import { Plus } from "lucide-react";
 
type SlideThumbnailProps = {
  slide: SlideType;
  isActive: boolean;
  onClick: () => void;
  containerWidth: number;
  onAddBelow?: () => void; // Add this prop for the add button functionality
};
 
const SlideThumbnail: React.FC<SlideThumbnailProps> = ({
  slide,
  isActive,
  onClick,
  containerWidth,
  onAddBelow
}) => {
  // Calculate aspect ratio (assuming 16:9 slides)
  const aspectRatio = 16 / 9;
  const thumbnailWidth = containerWidth;
  const thumbnailHeight = containerWidth / aspectRatio;
 
  // Calculate scale factor to fit elements within thumbnail
  const scaleFactor = thumbnailWidth / 800; // Assuming original slide width is 800px
 
  const [hovered, setHovered] = useState(false);
 
  return (
    <div
      onClick={onClick}
      className={`relative border rounded-md overflow-hidden cursor-pointer transition-all duration-300 ${
        isActive
          ? "border-blue-500 ring-2 ring-blue-400 shadow-lg"
          : "border-gray-300 hover:border-blue-300 hover:shadow-md"
      }`}
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
      <div className="absolute bottom-0 left-0 w-full bg-black/40 text-white text-xs px-1 truncate">
        {slide.title}
      </div>
     
      {/* Creative + button that appears on hover */}
      {hovered && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onAddBelow && onAddBelow();
    }}
    className="
                absolute -bottom-5 left-1/2 -translate-x-1/2
               bg-white/90 backdrop-blur-sm text-blue-600
               font-semibold p-2 rounded-full flex items-center
               justify-center shadow-md hover:bg-white
               transition-all duration-200 "
               
  >
    <Plus size={14} />
  </button>
        )}
 
    </div>
  );
};
 
export default SlideThumbnail;
 