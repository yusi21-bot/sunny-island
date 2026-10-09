import type {ImgHTMLAttributes} from "react";
export default function DemoImage({fill,priority,unoptimized,style,...props}:ImgHTMLAttributes<HTMLImageElement>&{fill?:boolean;priority?:boolean;unoptimized?:boolean}){return <img {...props} loading={priority?"eager":"lazy"} style={fill?{position:"absolute",inset:0,width:"100%",height:"100%",...style}:style}/>;}
