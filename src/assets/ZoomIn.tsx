import { useState } from 'react';
import { ChevronDown, ZoomIn, ZoomOut } from 'lucide-react';

export default function ZoomDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedZoom, setSelectedZoom] = useState('100%');

  const zoomOptions = ['50%', '75%', '100%', '125%', '150%', '200%', '300%'];

  const handleZoomSelect = (zoom:any) => {
    setSelectedZoom(zoom);
    setIsOpen(false);
  };

  const handleZoomIn = () => {
    const currentIndex = zoomOptions.indexOf(selectedZoom);
    if (currentIndex < zoomOptions.length - 1) {
      setSelectedZoom(zoomOptions[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = zoomOptions.indexOf(selectedZoom);
    if (currentIndex > 0) {
      setSelectedZoom(zoomOptions[currentIndex - 1]);
    }
  };

  return (
    <div className="relative  font-sans">
      {/* Dropdown Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 flex items-center ${isOpen ? 'text-white' : 'text-gray-700'} justify-between  bg-transparent rounded-lg shadow-sm `}>
        <span className="font-medium">{selectedZoom}</span>
        <ChevronDown 
          size={16} 
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute  w-30 bottom-13 left-0  mt-1 bg-gray-300 border border-gray-600 rounded-lg shadow-lg z-10">
          {/* Zoom In Button */}
          <button 
            onClick={handleZoomIn}
            className="w-full px-2 py-2   text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
          >
            <ZoomIn size={16} />
            Zoom In
          </button>

          {/* Zoom Out Button */}
          <button 
            onClick={handleZoomOut}
            className="w-full px-2 py-2 text-left text-gray-700 hover:bg-gray-200  flex items-center gap-3 "
          >
            <ZoomOut size={16} />
            Zoom Out
          </button>

          {/* Zoom Percentage Options */}
          <div className="py-2">
            {zoomOptions.map((zoom) => (
              <button
                key={zoom}
                onClick={() => handleZoomSelect(zoom)}
                className={`w-full px-2 py-2 text-center
                     hover:bg-blue-50 ${
                  selectedZoom === zoom ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                {zoom}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}