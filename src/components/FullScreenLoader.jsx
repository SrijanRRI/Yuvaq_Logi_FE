import Lottie from "lottie-react"
import animationData from "../assets/Animation - 1746444782565.json"

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="w-72 h-72 relative">
        <Lottie animationData={animationData} loop={true} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 pointer-events-none"></div>
      </div>
      <div className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full shadow-lg">
        <p className="text-lg font-semibold animate-pulse">Submitting your tender...</p>
      </div>
      <p className="text-slate-500 mt-4 max-w-md text-center">
        Please wait while we process your request. This may take a few moments.
      </p>
    </div>
  )
}

export default FullScreenLoader
