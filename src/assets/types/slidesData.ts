
type ShapeElement = {
  id: string | number;
  type: "shape" | "button";
  content?: string;
  shape?: string; // can expand later
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  shadow?: boolean;
  opacity?: number;
  border?: string|object
  borderRadius?: number | string;
  borderLeft?:string
  
  boxShadow?:string
  rotate?:number
  backdropFilter?:string
  backgroundBlendMode?:string
  color?:string
  fontSize?:number
  fontWeight?:string
  textAlign?:string
  fontFamily?:string
  letterSpacing?:number
  lineHeight?:number
  zIndex?:number
  hoverEffect?:object
  hoverText?:string
  hoverBgColor?:string
  link?:string
  target?:string
};
type IconElement = {
  id: string | number;
  type: "icon";
  name?: string;
  shape?: string; // can expand later
  x: number;
  y: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  shadow?: boolean;
  opacity?: number;
  border?: string
  borderRadius?: number | string;
  borderLeft?:string
  boxShadow?:string
  rotate?:number
  backdropFilter?:string
  backgroundBlendMode?:string
  zIndex?:number
  color?:string
  fontSize?:number
  size?:number
  fontWeight?:string
  textAlign?:string
};

type TextElement = {
  id: string | number;
  type: "text";
  content: string;
  x: number;
  y: number;
  width?: number;
  height: number;
  fontSize: number;
  fontWeight?: "bold" | "normal" | string;
  color: string;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  letterSpacing?: number;
  lineHeight?: number;
  fontStyle?:string;
  zIndex?:number
  textDecoration?:string
  opacity?: number;
};


type ImageElement = {
  id: string | number;
  type: "image";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
  filter?: string;
  borderRadius?: number | string;
  boxShadow?: string;
  border?: string;
  rotate?:number
  zIndex?:number
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
};


type GroupElement = {
  id: string | number;
  type: "group";
  elements: SlideElement[];
};


export type SlideElement =
  | IconElement
  | ShapeElement
  | TextElement
  | ImageElement
  | GroupElement;

export type SlideConfig = {
  id: number;
  title: string;
  subtitle?: string;
  date?: string;
  backgroundColor: string;
  textColor: string;
  elements: SlideElement[];
};
