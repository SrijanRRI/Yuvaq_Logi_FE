import { Player } from "@lottiefiles/react-lottie-player"
import animationData from "../assets/Animation - 1747394837118.json"

const FullScreenLoader = () => {
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-inner">
      <Player
        autoplay
        loop
        src={animationData}
        style={{ height: "300px", width: "300px" }}
      />
    </div>
  )
}

export default FullScreenLoader

