import { useState, useRef } from "react"
import { useEffect } from "react"
import { Plus, Square, ArrowUp, X } from "lucide-react"
import ImageModal from "./ImageModal"

export default function ChatInput({ sendMessage, droppedFiles, clearDroppedFiles, streaming, stopStreaming }){

const [text,setText] = useState("")
const [files,setFiles] = useState([])
const [modal,setModal] = useState(null)
const fileInputRef = useRef(null)

useEffect(()=>{

if(droppedFiles && droppedFiles.length>0){
setFiles(prev=>[...prev,...droppedFiles])
clearDroppedFiles()
}

},[droppedFiles])

const textareaRef = useRef(null)

function handleFiles(e){

const selected = Array.from(e.target.files)

setFiles(prev => [...prev, ...selected])

// reset file input so same file can be selected again
e.target.value = null

}

function removeFile(index){

setFiles(prev => prev.filter((_,i)=>i!==index))

}

function handleSend(){
if(streaming) return

if(!text && files.length === 0) return

sendMessage(text,files)

setText("")
setFiles([])

if(textareaRef.current){
textareaRef.current.style.height="24px"
}

if(fileInputRef.current){
fileInputRef.current.value = null
}

}

function autoResize(){

if(!textareaRef.current) return

textareaRef.current.style.height="24px"
textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"

}

return(

<div className="px-6 pb-6 flex justify-center">

<div className="w-full max-w-3xl">

<div className="bg-[#0b0b0b] border border-white/10 rounded-xl overflow-hidden">

{/* ATTACHMENTS */}

{files.length > 0 && (

<div className="flex gap-2 p-3 border-b border-white/10 flex-wrap">

{files.map((file,i)=>{

const isImage = file.type?.startsWith("image")

return(

<div
key={i}
className="relative w-16 h-12 flex-shrink-0 rounded-md bg-white/5 border border-white/10">

{isImage ? (

<img
src={URL.createObjectURL(file)}
onClick={()=>setModal(URL.createObjectURL(file))}
className="w-full h-full object-cover cursor-pointer hover:opacity-90"
/>

):(

<div className="w-full h-full flex items-center justify-center text-[10px] text-cyan-300 px-1 text-center">
{file.name}
</div>

)}

<button
onClick={()=>removeFile(i)}
className="absolute -top-2 -right-2 z-10 bg-black border border-white/30 rounded-full w-5 h-5 flex items-center justify-center">

<X size={12}/>

</button>

</div>

)

})}

</div>

)}

{/* INPUT ROW */}

<div className="flex items-center gap-2 px-3 py-1.5">

<label className="cursor-pointer">

<div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center">

<Plus size={16}/>

</div>

<input
type="file"
multiple
ref={fileInputRef}
className="hidden"
onChange={handleFiles}
/>

</label>

<textarea
ref={textareaRef}
value={text}
rows={1}
onChange={(e)=>{
setText(e.target.value)
autoResize()
}}
onKeyDown={(e)=>{

if(e.key==="Enter" && !e.shiftKey){

e.preventDefault()
handleSend()

}

}}
placeholder="Ask SACH-AI..."
className="flex-1 bg-transparent outline-none text-sm resize-none overflow-hidden"
/>

<button
onClick={streaming ? stopStreaming : handleSend}
className="w-7 h-7 rounded-full bg-white flex items-center justify-center">

{streaming ? (
<div className="w-3 h-3 bg-black rounded-sm"></div>
) : (
<ArrowUp size={14} className="text-black"/>
)}

</button>

</div>

</div>

</div>

{modal && (
<ImageModal
src={modal}
onClose={()=>setModal(null)}
/>
)}

</div>

)
}