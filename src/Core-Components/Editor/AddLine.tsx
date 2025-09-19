import React, { useEffect, useRef, useState, type Dispatch, type JSX, type SetStateAction } from "react";
import { Trash2, Palette, Code, Paintbrush } from "lucide-react";
import { IconImport } from "../../Components/IconImport";
import useDragable from "../../Hooks/useDragable";
import { useClickOutside } from "../../Hooks/useClickOutside";
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
type MyProps = {
  setAddLine: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function AddLine({ setAddLine }: MyProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [svgElements, setSvgElements] = useState<SVGElement[]>([]);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [showLexicalEditor, setShowLexicalEditor] = useState(false);
  const [svgContent, setSvgContent] = useState("");
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const [activeEditorBtn, setActiveEditorBtn] = useState<number | null>(null);

  // Default colors and stroke width
  const [defaultStrokeColor, setDefaultStrokeColor] = useState("#000000");
  const [defaultStrokeWidth, setDefaultStrokeWidth] = useState(3);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleToolBox = useDragable();
  const generateSvgElements = (currentPoints: Point[]): SVGElement[] => {
    const elements: SVGElement[] = [];

    // Add points as circles
    currentPoints.forEach((point, index) => {
      const color =
        index === 0
          ? "green"
          : index === currentPoints.length - 1
          ? "red"
          : "orange";
      elements.push({
        type: "circle",
        points: [point],
        color,
        strokeWidth: 2,
        fillColor: color,
      });
    });

    // Add lines/curves based on point count
    if (currentPoints.length === 2) {
      elements.push({
        type: "line",
        points: [currentPoints[0], currentPoints[1]],
        color: defaultStrokeColor,
        strokeWidth: defaultStrokeWidth,
      });
    } else if (currentPoints.length === 3) {
      elements.push({
        type: "quadratic",
        points: currentPoints,
        color: defaultStrokeColor,
        strokeWidth: defaultStrokeWidth,
      });
    } else if (currentPoints.length === 4) {
      elements.push({
        type: "cubic",
        points: currentPoints,
        color: defaultStrokeColor,
        strokeWidth: defaultStrokeWidth,
      });
    }

    return elements;
  };

  const generateSvgContentString = (elements: SVGElement[]): string => {
    let content = "";

    elements.forEach((element, index) => {
      switch (element.type) {
        case "circle":
          content += `<circle cx="${element.points[0].x}" cy="${
            element.points[0].y
          }" r="4" fill="${
            element.fillColor || element.color
          }" stroke="white" stroke-width="${element.strokeWidth}"/>\n`;
          break;

        case "line":
          content += `<line x1="${element.points[0].x}" y1="${element.points[0].y}" x2="${element.points[1].x}" y2="${element.points[1].y}" stroke="${element.color}" stroke-width="${element.strokeWidth}"/>\n`;
          break;

        case "quadratic":
          content += `<path d="M ${element.points[0].x} ${element.points[0].y} Q ${element.points[1].x} ${element.points[1].y} ${element.points[2].x} ${element.points[2].y}" stroke="${element.color}" stroke-width="${element.strokeWidth}" fill="transparent"/>\n`;
          break;

        case "cubic":
          content += `<path d="M ${element.points[0].x} ${element.points[0].y} C ${element.points[1].x} ${element.points[1].y}, ${element.points[2].x} ${element.points[2].y}, ${element.points[3].x} ${element.points[3].y}" stroke="${element.color}" stroke-width="${element.strokeWidth}" fill="transparent"/>\n`;
          break;
      }
    });

    return content;
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints((prev) => [...prev, { x, y }]);
  };

  useEffect(() => {
    if (points.length > 4) {
      setPoints(points.slice(1));
    }
  }, [points]);

  useClickOutside({
    ref: containerRef,
    enabled: showStyleEditor, 
    bubbling: false,
    onClickOutside: () => {
      setShowStyleEditor(false);
      setActiveEditorBtn(null);
      setAddLine(false)
      console.log("clicked outside");
    },
  });

  useEffect(() => {
    const newSvgElements = generateSvgElements(points);
    setSvgElements(newSvgElements);

    // Update SVG content string
    const newSvgContent = generateSvgContentString(newSvgElements);
    setSvgContent(newSvgContent);
  }, [points, defaultStrokeColor, defaultStrokeWidth]);

  const clearPoints = () => {
    setPoints([]);
  };

  const renderSvgElement = (
    element: SVGElement,
    index: number
  ): JSX.Element | null => {
    const key = `${element.type}-${index}`;

    switch (element.type) {
      case "circle":
        return (
          <circle
            key={key}
            cx={element.points[0].x}
            cy={element.points[0].y}
            r="4"
            fill={element.fillColor || element.color}
            stroke="white"
            strokeWidth={element.strokeWidth}
          />
        );

      case "line":
        return (
          <line
            key={key}
            x1={element.points[0].x}
            y1={element.points[0].y}
            x2={element.points[1].x}
            y2={element.points[1].y}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
          />
        );

      case "quadratic":
        return (
          <path
            key={key}
            d={`M ${element.points[0].x} ${element.points[0].y} Q ${element.points[1].x} ${element.points[1].y} ${element.points[2].x} ${element.points[2].y}`}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            fill="transparent"
          />
        );

      case "cubic":
        return (
          <path
            key={key}
            d={`M ${element.points[0].x} ${element.points[0].y} C ${element.points[1].x} ${element.points[1].y}, ${element.points[2].x} ${element.points[2].y}, ${element.points[3].x} ${element.points[3].y}`}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            fill="transparent"
          />
        );

      default:
        return null;
    }
  };

  const editorBox = [
    { icon: "Trash2", hoverText: "Clear Points", function: "clear" },
    { icon: "paint-bucket", hoverText: "Style Editor", function: "style" },
    { icon: "x", hoverText: "Style Editor", function: "cancel" },
  ];

  const handleButtonClick = (idx: number, func: string, e: any) => {
    e.stopPropagation();
    
    setActiveEditorBtn(activeEditorBtn === idx ? null : idx);

    if (idx === 0) clearPoints();
    if (idx === 1) {
      setShowStyleEditor(!showStyleEditor);
      if (showLexicalEditor) setShowLexicalEditor(false);
    }
    if (idx === 2) {
      setShowLexicalEditor(!showLexicalEditor);
      if (showStyleEditor) setShowStyleEditor(false);
    }
    if(func === "cancel"){
      setAddLine(false)
    }
  };

  const renderSvgFromString = (svgString: string): JSX.Element | null => {
    try {
      return <g dangerouslySetInnerHTML={{ __html: svgString }} />;
    } catch (error) {
      console.error("Error rendering SVG:", error);
      return null;
    }
  };

  return (
    <div
      onMouseDown={handleToolBox}
      className="bg-transparent p-6 rounded-lg shadow-lg"
    >
      {/* Editor Toolbar */}
      <div
        style={{
          position: "absolute",
          alignItems: "center",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "32px",
          padding: "12px 20px",
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(10px) saturate(120%)",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          zIndex: 10,
        }}
      >
        {editorBox.map((btn, idx) => (
          <div
            key={idx}
            onClick={(e) => handleButtonClick(idx, btn.function, e)}
            onMouseEnter={() => setHoveredButton(idx)}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              position: "relative",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: activeEditorBtn === idx ? "#1e3a8a" : "transparent",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              color: activeEditorBtn === idx ? "#fff" : "#374151",
              boxShadow:
                activeEditorBtn === idx
                  ? "0 2px 8px rgba(30, 58, 138, 0.3)"
                  : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {activeEditorBtn === idx ? (
                <IconImport size={28} name={btn.icon} color="white" />
              ) : (
                <IconImport size={28} name={btn.icon} color="#374151" />
              )}
              {idx === 1 ? (
                <div
                  className={`w-[90%] h-[3px] rounded-md`}
                  style={{ backgroundColor: defaultStrokeColor }}
                ></div>
              ) : null}
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
                top: -35,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#1e3a8a",
                color: "white",
                padding: "6px 10px",
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

      {/* Style Editor Panel */}
      {showStyleEditor && (
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            bottom: 100,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "20px",
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(10px) saturate(120%)",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            zIndex: 9,
            minWidth: "400px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "24px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <label
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Color:
              </label>
              <input
                type="color"
                value={defaultStrokeColor}
                onChange={(e) => setDefaultStrokeColor(e.target.value)}
                style={{
                  width: "48px",
                  height: "40px",
                  borderRadius: "8px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  background: "rgba(255, 255, 255, 0.2)",
                  cursor: "pointer",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <label
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Width:
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={defaultStrokeWidth}
                  onChange={(e) => setDefaultStrokeWidth(+e.target.value)}
                  style={{ width: "96px" }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    minWidth: "30px",
                  }}
                >
                  {defaultStrokeWidth}px
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawing Canvas */}
      <div className="bg-transparent p-4 rounded-lg shadow-lg inline-block">
        <svg
          width="600"
          height="400"
          style={{ cursor: "crosshair" }}
          onClick={handleClick}
          className=""
        >
          {showLexicalEditor
            ? renderSvgFromString(svgContent)
            : svgElements.map((element, index) =>
                renderSvgElement(element, index)
              )}
        </svg>
      </div>
    </div>
  );
}
