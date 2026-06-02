import React from 'react'

function Logo({ width = '160px' }) {
  const numericWidth = Number.parseInt(width, 10)
  const compactLogo = Number.isFinite(numericWidth) && numericWidth <= 90

  return (
    <div style={{ width }}>
      <svg
        viewBox={compactLogo ? '0 0 64 64' : '0 0 240 64'}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        role='img'
        aria-label='Bloggy logo'
        className='h-auto w-full'
      >
        <defs>
          <linearGradient id='logoGradient' x1='12' y1='8' x2='54' y2='56' gradientUnits='userSpaceOnUse'>
            <stop stopColor='#0F172A' />
            <stop offset='1' stopColor='#2563EB' />
          </linearGradient>
          <linearGradient id='accentGradient' x1='21' y1='18' x2='44' y2='44' gradientUnits='userSpaceOnUse'>
            <stop stopColor='#60A5FA' />
            <stop offset='1' stopColor='#BFDBFE' />
          </linearGradient>
        </defs>

        <rect x='8' y='8' width='48' height='48' rx='16' fill='url(#logoGradient)' />
        <path
          d='M22 20H34C40.6274 20 46 25.3726 46 32C46 38.6274 40.6274 44 34 44H22V20Z'
          fill='white'
          fillOpacity='0.96'
        />
        <path
          d='M28 26H35C38.3137 26 41 28.6863 41 32C41 35.3137 38.3137 38 35 38H28V26Z'
          fill='url(#accentGradient)'
        />
        <path
          d='M18 48L26.2 39.8H34.5'
          stroke='#93C5FD'
          strokeWidth='2.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        {!compactLogo && (
          <>
            <path d='M74 24.5H105' stroke='#CBD5E1' strokeWidth='1.5' strokeLinecap='round' />
            <text
              x='74'
              y='40'
              fill='#0F172A'
              style={{
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                fontFamily: 'Segoe UI, Arial, sans-serif',
              }}
            >
              Bloggy
            </text>
            <text
              x='74'
              y='52'
              fill='#64748B'
              style={{
                fontSize: '8px',
                fontWeight: 600,
                letterSpacing: '0.32em',
                fontFamily: 'Segoe UI, Arial, sans-serif',
              }}
            >
              {/* PUBLISH • SHARE • GROW */}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}

export default Logo




// import React from 'react'

// function Logo({width = '100px'}) {
//   return (
//     <div style={{width}}>Logo</div>
//   )
// }

// export default Logo