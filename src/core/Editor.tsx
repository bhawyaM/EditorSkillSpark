import EditorBox from "../Components/EditorBox"
import type { SlideConfig } from "../assets/types/slidesData"
const Editor = ({ setSlides, slides, currentSlide }:{ setSlides: React.Dispatch<React.SetStateAction<SlideConfig[]>>, slides: SlideConfig[], currentSlide: number }) => {
  return (
    <div className="flex-1 p-8">
        <div className="max-w-4xl">
            <EditorBox setSlides={setSlides} slides={slides}  currentSlide={currentSlide}  />
            
        </div>
      </div>
  )
}

export default Editor