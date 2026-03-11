import { useState,useEffect } from "react"

export default function Thinking({type="text"}){

const textSteps=[
"SACH-AI is thinking"
]

const imageSteps=[
"Analyzing image",
"Reading pixel structures",
"Detecting AI artifacts",
"Running deepfake model"
]

const videoSteps=[
"Processing video",
"Extracting frames",
"Analyzing frame consistency",
"Detecting manipulation"
]

const audioSteps=[
"Processing audio",
"Generating transcript",
"Analyzing spoken claims"
]

let steps=textSteps

if(type==="image") steps=imageSteps
if(type==="video") steps=videoSteps
if(type==="audio") steps=audioSteps

const [index,setIndex]=useState(0)

useEffect(()=>{

const interval=setInterval(()=>{
setIndex(prev=>(prev+1)%steps.length)
},1500)

return ()=>clearInterval(interval)

},[type])

return(

<div className="flex items-center gap-3 text-cyan-400 ml-5">


{/* animated dots */}

<div className="flex gap-1">

<div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
<div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
<div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300"></div>

</div>

<p className="text-gray-400 text-sm">
{steps[index]}
</p>

</div>

)
}