export default function TopBar() {
  return (
    <div className="w-full h-15 bg-[#f9c821] flex items-center overflow-hidden relative border-b border-white/10 flex justify-center">
      {/* Animated headline */}
      <div className="absolute whitespace-nowrap  text-black font-medium tracking-widest text-md">
        <span className="mx-8 font-bold">THE MOST TRUSTED GOLF CAR ACCESSORIES SINCE 1989</span>
        <span className="mx-8 font-bold text-black">•</span>
        <span className="mx-8 font-bold">PREMIUM QUALITY GUARANTEED</span>
        <span className="mx-8 font-bold text-black">•</span>
        <span className="mx-8 font-bold">FREE SHIPPING ON ORDERS OVER $500</span>
      </div>
    </div>
  );
}
