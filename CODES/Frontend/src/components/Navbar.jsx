import logo from "../assets/logo.png"

export default function Navbar(){

return(

<div className="w-full flex justify-center items-center py-4 border-b border-white/10">

<div className="flex items-center gap-3">

<img
src={logo}
className="h-8"
/>

<span className="text-orange-400 font-semibold tracking-wider text-lg
bg-orange-500/10 px-3 py-1 rounded-md border border-orange-400/30">
HACKATHON MVP
</span>

</div>

</div>

)

}