import { motion } from "framer-motion"
import ImageModal from "./ImageModal"
import Thinking from "./Thinking"
import { useState, useEffect ,useRef } from "react"

function Typewriter({ text }) {

const [display,setDisplay] = useState("")
const indexRef = useRef(0)

useEffect(()=>{

setDisplay("")
indexRef.current = 0

const interval = setInterval(()=>{

if(indexRef.current >= text.length){
clearInterval(interval)
return
}

setDisplay(text.slice(0,indexRef.current + 1))

indexRef.current++

},12)

return ()=>clearInterval(interval)

},[text])

return <span>{display}</span>

}





export default function ChatMessage({ msg, streaming, inputType }) {

const [modal,setModal] = useState(null)

if (msg.type === "user") {

const files = msg.files || []

return (

<>
<motion.div
initial={{ opacity:0, x:40 }}
animate={{ opacity:1, x:0 }}
transition={{ duration:0.3 }}
className="flex justify-end"
>

<div className="flex flex-col items-end gap-2">

{/* ATTACHMENTS */}

{files.length > 0 && (

<div className="flex flex-wrap gap-2">

{files.map((file,i)=>{

const isImage = file.type?.startsWith("image")
const isVideo = file.type?.startsWith("video")

return(

<div
key={i}
className="w-20 h-20 rounded-lg overflow-hidden
bg-white/5 border border-cyan-500/30
shadow-[0_0_10px_rgba(34,211,238,0.1)]
flex items-center justify-center"
>

{isImage && (

<img
src={URL.createObjectURL(file)}
onClick={()=>setModal(URL.createObjectURL(file))}
className="w-full h-full object-cover cursor-pointer hover:opacity-90"
/>

)}

{isVideo && (

<video controls className="w-full h-full object-cover">
<source src={URL.createObjectURL(file)} />
</video>

)}

{!isImage && !isVideo && (

<div className="text-xs text-cyan-300 text-center px-2">
📄 {file.name}
</div>

)}

</div>

)

})}

</div>

)}

{/* TEXT MESSAGE */}

{msg.content && (

<div className="bg-cyan-500/10 border border-cyan-400/40
px-4 py-2 rounded-2xl text-sm max-w-md">

{msg.content}

</div>

)}

</div>
</motion.div>

{modal && (
<ImageModal
src={modal}
onClose={()=>setModal(null)}
/>
)}

</>

)
}




if(msg.type==="ai"){

const blocks = msg.blocks || []

if(streaming && blocks.length === 0){
return(

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
transition={{duration:0.35}}
className="flex"
>

<div className="bg-white/5 backdrop-blur-xl border border-purple-500/30
shadow-[0_0_20px_rgba(168,85,247,0.15)]
px-5 py-4 mx-3 rounded-2xl w-[640px] text-sm">

<Thinking type={inputType}/>

</div>

</motion.div>

)
}

const answerBlock = blocks.find(b=>b.type==="answer")

const isChatMode = !!answerBlock


if(isChatMode){

return(

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
transition={{duration:0.35}}
className="flex"
>

<div className="bg-white/5 backdrop-blur-xl border border-cyan-400/30
shadow-[0_0_20px_rgba(34,211,238,0.15)]
px-5 py-4 mx-3 rounded-2xl max-w-[640px] text-sm text-gray-300">

<Typewriter text={answerBlock.content}/>

</div>

</motion.div>

)

}

return(

<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.35 }}
className="flex"
>

<div className="bg-white/5 backdrop-blur-xl border border-purple-500/30
shadow-[0_0_20px_rgba(168,85,247,0.15)]
px-5 py-4 mx-3 rounded-2xl w-[640px] text-sm space-y-4">

{blocks.map((block,i)=>{


if(block.type==="greeting"){

return(
<p key={i} className="text-cyan-300 font-medium">
<Typewriter text={block.content}/>
</p>
)

}


if(block.type==="text"){

return(
<p key={i} className="text-gray-300">
<Typewriter text={block.content}/>
</p>
)

}


if(block.type==="result"){

return(

<div key={i} className="bg-purple-500/10 border border-purple-400/30 p-3 rounded-lg">

<p className="text-purple-300 text-xs mb-1">
Analysis Result
</p>

<p className="text-gray-300">
<Typewriter text={block.content}/>
</p>

</div>

)

}



if(block.type==="trust_score"){

return(

<div key={i}>

<div className="flex justify-between text-xs text-gray-400">
<span>Trust Score</span>
<span>{block.score}%</span>
</div>

<div className="w-full h-2 bg-white/10 rounded-full mt-1">

<motion.div
initial={{ width: 0 }}
animate={{ width: block.score+"%" }}
transition={{ duration: 0.8 }}
className={`h-2 rounded-full ${
block.score > 70 ? "bg-green-500" :
block.score > 40 ? "bg-yellow-500" :
"bg-red-500"
}`}
/>

</div>

</div>

)

}



if(block.type==="explanation"){

const lines = block.content.split("\n")

const bulletLines = lines.filter(l => l.trim().startsWith("-"))
const normalLines = lines.filter(l => !l.trim().startsWith("-"))

return(

<div key={i} className="text-gray-300 leading-relaxed space-y-2">

{normalLines.length > 0 && (
<p>
<Typewriter
text={normalLines.join(" ")}
onDone={()=>{

setTimeout(()=>{
setVisibleBlocks(v=>{
if(v < blocks.length) return v+1
return v
})
},500)

}}
/>
</p>
)}

{bulletLines.length > 0 && (
<ul className="list-disc ml-5 space-y-1 text-gray-300">
{bulletLines.map((b,j)=>(
<li key={j}>{b.replace(/^-\s*/, "")}</li>
))}
</ul>
)}

</div>

)
}



if(block.type==="sources"){

return(

<div key={i}>

<p className="text-xs text-gray-400 mb-2">
Sources
</p>

<div className="flex flex-col gap-2">

{block.links.map((s,j)=>(

<a
key={j}
href={s.startsWith("http") ? s : `https://${s}`}
target="_blank"
className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-cyan-400 hover:bg-white/10"
>

{s}

</a>

))}

</div>

</div>

)

}

return null

})}

</div>

</motion.div>

)

}

return null
}