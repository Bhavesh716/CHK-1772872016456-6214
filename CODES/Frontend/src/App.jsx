import Navbar from "./components/Navbar"
import ChatMessage from "./components/ChatMessage"
import ChatInput from "./components/ChatInput"
import Thinking from "./components/Thinking"
import { useState, useRef, useEffect } from "react"

function App() {

function handleDragEnter(e){
e.preventDefault()
dragCounter.current++
setDrag(true)
}

function handleDragLeave(e){
e.preventDefault()
dragCounter.current--

if(dragCounter.current === 0){
setDrag(false)
}
}

function handleDrop(e){
e.preventDefault()

dragCounter.current = 0
setDrag(false)

const files = Array.from(e.dataTransfer.files)

setDroppedFiles(files)
}

const bottomRef = useRef(null)
const dragCounter = useRef(0)

const [droppedFiles,setDroppedFiles] = useState([])
const [messages,setMessages] = useState([])
const [loading,setLoading] = useState(false)
const [drag,setDrag] = useState(false)
const [streaming,setStreaming] = useState(false)
const controllerRef = useRef(null)
const [firstBlockReceived,setFirstBlockReceived] = useState(false)
const stopRef = useRef(false)

useEffect(()=>{
bottomRef.current?.scrollIntoView({behavior:"smooth",block:"end"})
},[messages,loading])




async function sendMessage(text,files){

const userMsg={
type:"user",
content:text,
files:files
}

const aiMsg={
type:"ai",
blocks:[]
}

setMessages(prev=>[
...prev,
userMsg,
aiMsg
])

setStreaming(true)
setFirstBlockReceived(false)
stopRef.current = false



const formData = new FormData()

formData.append("text", text)

files.forEach(file=>{
formData.append("files", file)
})

controllerRef.current = new AbortController()

const response = await fetch("http://localhost:8000/analyze",{
method:"POST",
body:formData,
signal:controllerRef.current.signal
})

if(!response.ok){
console.error("Backend error")
setStreaming(false)
return
}

const reader = response.body.getReader()
const decoder = new TextDecoder()

while(true){

if(stopRef.current) break

const {done,value} = await reader.read()

if(done) break

const chunk = decoder.decode(value)

const lines = chunk.split("\n").filter(Boolean)

for(const line of lines){

let block

try{
  block = JSON.parse(line)
}catch(e){
  console.warn("Invalid block from AI:", line)
  continue
}

setMessages(prev=>{

const newMessages=[...prev]

const aiIndex=newMessages.length-1

newMessages[aiIndex]={
...newMessages[aiIndex],
blocks:[
...newMessages[aiIndex].blocks,
block
]
}

return newMessages

})

setFirstBlockReceived(true)
}

}

setStreaming(false)

}



function stopStreaming(){

stopRef.current = true

if(controllerRef.current){
controllerRef.current.abort()
}

setStreaming(false)

}





let inputType = "text"

const lastUserMessage = [...messages].reverse().find(m => m.type === "user")

if(lastUserMessage?.files?.length){

const files = lastUserMessage.files

if(files.some(f => f.type.startsWith("image"))){
inputType = "image"
}
else if(files.some(f => f.type.startsWith("video"))){
inputType = "video"
}
else if(files.some(f => f.type.startsWith("audio"))){
inputType = "audio"
}

}




return(

<div
className="h-screen text-white flex flex-col bg-black"
onDragEnter={handleDragEnter}
onDragLeave={handleDragLeave}
onDragOver={(e)=>e.preventDefault()}
onDrop={handleDrop}
>

<Navbar/>

<div className="flex-1 overflow-y-auto px-6 py-8">

<div className="max-w-3xl mx-auto space-y-4">

{messages.map((m,i)=>(
<ChatMessage
key={i}
msg={m}
streaming={streaming}
inputType={inputType}
/>
))}


<div ref={bottomRef}></div>

</div>

</div>

{drag && (

<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 text-cyan-400 text-xl">

Drop file to analyze

</div>

)}

<ChatInput 
sendMessage={sendMessage}
droppedFiles={droppedFiles}
clearDroppedFiles={()=>setDroppedFiles([])}
streaming={streaming}
stopStreaming={stopStreaming}
/>

</div>

)

}

export default App