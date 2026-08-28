export function RotatingEarth() {
  return (
    <div className="earth-wrap" aria-label="Slowly rotating Earth visualisation" role="img">
      <div className="earth-glow" />
      <svg className="earth" viewBox="0 0 180 180" aria-hidden="true">
        <defs>
          <radialGradient id="ocean" cx="34%" cy="28%">
            <stop offset="0%" stopColor="#163c4b" />
            <stop offset="68%" stopColor="#0b2733" />
            <stop offset="100%" stopColor="#06121a" />
          </radialGradient>
          <clipPath id="globeClip"><circle cx="90" cy="90" r="69" /></clipPath>
        </defs>
        <circle cx="90" cy="90" r="72" fill="none" stroke="#11e5cf" strokeOpacity=".22" />
        <circle cx="90" cy="90" r="69" fill="url(#ocean)" stroke="#6fffe9" strokeOpacity=".55" />
        <g clipPath="url(#globeClip)" className="land-track">
          <path d="M35 57l13-17 20-4 11 8-3 11 11 8-8 13-18 1-9-7-10 4z" />
          <path d="M91 35l20 4 9 12 16 4 14 15-4 12-18-4-9 10-8-7-13 5-10-14 6-12-9-9z" />
          <path d="M108 98l17 3 12 14-4 21-14 16-10-8-4-20-10-9z" />
          <path d="M48 91l17 7 10 16-8 27-12 13-9-11 3-17-10-16z" />
          <path d="M153 80l12 3 4 12-11 9-9-8z" />
          <path d="M179 57l13-17 20-4 11 8-3 11 11 8-8 13-18 1-9-7-10 4z" />
        </g>
        <ellipse cx="90" cy="90" rx="69" ry="25" fill="none" stroke="#71ffee" strokeOpacity=".16" />
        <ellipse cx="90" cy="90" rx="30" ry="69" fill="none" stroke="#71ffee" strokeOpacity=".12" />
        <path d="M40 119c28 14 73 14 101-1" fill="none" stroke="#ef4454" strokeOpacity=".55" strokeDasharray="3 7" />
        <circle cx="123" cy="116" r="4" fill="#ef4454" className="pulse-dot" />
      </svg>
      <span className="orbit orbit-one" />
      <span className="orbit orbit-two" />
    </div>
  );
}
