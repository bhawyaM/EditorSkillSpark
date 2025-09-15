import "./App.css";
import Editor from "./Components/Editor";
import SlideDrawer from "./Components/slideDrawer";

function App() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <SlideDrawer />
      {/* Main Content Area */}
      <Editor />
    </div>
  );
}
export default App;
