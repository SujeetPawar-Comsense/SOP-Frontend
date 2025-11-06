import exampleImage from 'figma:asset/c12a4812af33d127c3a3b8996acb7e7addecb70f.png';

export default function FuturisticBackground() {
  return (
    <>
      {/* Main geometric background overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Animated geometric shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 border border-primary/20 transform rotate-45 animate-pulse"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 border border-primary/30 transform rotate-12"></div>
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 border border-primary/15 transform -rotate-12"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 border border-primary/25 transform rotate-45"></div>
        
        {/* Glowing lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-2/3 w-1 h-1 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Gradient overlays for depth */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-cyan-500/10 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-500/10 via-transparent to-transparent"></div>
      </div>
    </>
  )
}