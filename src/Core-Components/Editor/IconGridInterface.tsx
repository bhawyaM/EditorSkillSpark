import React, { useState, useRef, useEffect } from "react";
import {
  Home,
  User,
  Heart,
  Star,
  Settings,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  AtSign,
  Download,
  Upload,
  Share,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Lock,
  Shield,
  X,
} from "lucide-react";
import { i } from "framer-motion/client";
import {useClickOutside} from "../../Hooks/useClickOutside";

type addElement = {
  functionAddIcon: (icon: string) => void;
  setIconShape: React.Dispatch<React.SetStateAction<string>>;
  setIconBox: React.Dispatch<React.SetStateAction<boolean>>;
  iconBox: boolean;
  setActiveEditorBtn: React.Dispatch<React.SetStateAction<number | null>>;
};

export default function IconGridInterface({
  functionAddIcon,
  setIconShape,
  iconBox,
  setIconBox,
  setActiveEditorBtn
}: addElement) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [visibilityPercentage, setVisibilityPercentage] = useState(0);


  const icons = [
    { icon: Home, name: "Home" },
    { icon: User, name: "User" },
    { icon: Heart, name: "Heart" },
    { icon: Star, name: "Star" },
    { icon: Settings, name: "Settings" },
    { icon: Search, name: "Search" },
    { icon: Mail, name: "Mail" },
    { icon: Phone, name: "Phone" },
    { icon: Calendar, name: "Calendar" },
    { icon: Clock, name: "Clock" },
    { icon: MapPin, name: "Location" },
    { icon: AtSign, name: "At Sign" },
    { icon: Download, name: "Download" },
    { icon: Upload, name: "Upload" },
    { icon: Share, name: "Share" },
    { icon: ThumbsUp, name: "Thumbs Up" },
    { icon: ThumbsDown, name: "Thumbs Down" },
    { icon: Eye, name: "Eye" },
    { icon: Lock, name: "Lock" },
    { icon: Shield, name: "Shield" },
  ];

  const filteredIcons = icons.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Intersection Observer for visibility detection
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     // if click target is NOT inside the ref container
  //     console.log("hello", iconBox);
  //     event.stopPropagation();
  //     event.preventDefault();
  //     //@ts-ignore
  //     if (
  //       containerRef.current &&
  //       !containerRef.current.contains(event.target as Node) && iconBox
  //     ) {
  //       setIconBox(false);
  //       setActiveEditorBtn(null);
  //     }
  //   }

  //   document.addEventListener("click", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("click", handleClickOutside);
  //   };
  // }, []);

  return (
    <div
      className={`max-w-md w-full mx-auto border border-gray-800 rounded-lg shadow-lg
              backdrop-blur-lg backdrop-saturate-150 bg-white/40
              transition-all duration-300 ${
                isVisible ? "scale-100" : "scale-95"
              }`}
    >
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Icon"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
            style={{
              background: "rgba(255, 255, 255, 0.9)", // Slightly transparent white for input
            }}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Icon Grid */}
      <div className="p-4">
        <div className="grid grid-cols-5 gap-1">
          {filteredIcons.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  setIconShape(item.name.toLowerCase());
                  functionAddIcon(item.name.toLowerCase());
                }}
                className="flex flex-col items-center justify-center p-3 rounded-lg transition-colors duration-200 group hover:bg-gray-100"
                title={item.name}
              >
                <IconComponent
                  size={24}
                  className="text-gray-600 group-hover:text-blue-900 transition-colors duration-200"
                />
              </button>
            );
          })}
        </div>

        {filteredIcons.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            <Search size={32} className="mx-auto mb-2 text-gray-300" />
            <p>No icons found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
