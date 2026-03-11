import { X } from "lucide-react"
import { useState } from "react"

export default function ImageModal({src,onClose}){

const [zoom,setZoom] = useState(1)

if(!src) return null

return(

<div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">

<button
onClick={onClose}
className="absolute top-6 right-6 text-white">
<X size={28}/>
</button>

<div
onWheel={(e)=>{
e.preventDefault()
setZoom(z=>Math.max(0.5,Math.min(3,z+(e.deltaY<0?0.1:-0.1))))
}}
>

<img
src={src}
style={{transform:`scale(${zoom})`}}
className="max-h-[90vh] transition-transform"
/>

</div>

</div>

)
}