import React from "react"
import Lottie from "lottie-react"
import animationData from "../assets/Animation - 1746444782565.json"

const FullScreenLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 w-full h-full">
            <div className="w-72 h-72">
                <Lottie animationData={animationData} loop={true} />
            </div>
            <p className="text-lg font-semibold text-slate-600 animate-pulse">
                Submitting your tender...
            </p>
        </div>
    )
}

export default FullScreenLoader
