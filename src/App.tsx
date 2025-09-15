import './App.css'
import Editor from './Components/Editor';
import { 
  Home, 
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Image
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: NavItem[];
}
import React, { useState, useEffect } from 'react';


interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: NavItem[];
}
function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [expandedItems, setExpandedItems] = useState<string[]>(['reports']);

  const navItems: NavItem[] = [
    {
      id: 'slides',
      label: 'Slides',
      icon: <Image size={20} />,
    },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleExpanded(itemId);
    } else {
      setActiveItem(itemId);
    }
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeItem === item.id;
    const paddingLeft = level === 0 ? 'pl-6' : 'pl-12';

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item.id, hasChildren as boolean)}
          className={`
            w-full flex items-center justify-between ${paddingLeft} pr-4 py-3 text-left
            transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700
            ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
            ${!isOpen && level === 0 ? 'justify-center px-4' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            {isOpen && <span className="font-medium">{item.label}</span>}
          </div>
          {isOpen && hasChildren && (
            <div className="transition-transform duration-200">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
        </button>
        
        {hasChildren && isExpanded && isOpen && (
          <div className="bg-gray-50 dark:bg-gray-800/50">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`
        bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-16'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map(item => renderNavItem(item))}
          </div>
        </nav>

        {/* Footer add user info here */}
        {/* {isOpen && (

        )} */}
      </div>

      {/* Main Content Area */}
      <Editor />

    </div>
  );
}
export default App
