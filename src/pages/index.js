import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const waterTips = [
    "Fix leaking taps immediately - a dripping tap can waste up to 30 litres per day",
    "Take shorter showers - reduce shower time by 2 minutes to save 20 litres",
    "Water your garden early morning or late evening to reduce evaporation",
    "Use a bucket instead of a hose when washing your car",
    "Reuse greywater from washing machines for gardens",
    "Check for hidden leaks in your pipes regularly",
    "Turn off the tap while brushing your teeth - save 12 litres per day"
  ];

  const [currentTip, setCurrentTip] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % waterTips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Add each township’s link path here
  const locations = [
    { name: 'Soweto', households: '',  link: '/soweto' },
    { name: 'Alexandra', households: '',  link: '/alexandra' },
    { name: 'Tembisa', households: '',  link: '/tembisa' },
  ];

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
        rel="stylesheet"
      />

      <div
        className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-5 position-relative overflow-hidden"
        style={{
          background:
            'linear-gradient(to bottom right, #f8f9fa 0%, #e7f3ff 50%, #e0f7fa 100%)',
        }}
      >
        {/* Animated background blobs */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="position-absolute animate-blob"
            style={{
              top: '5rem',
              left: '2.5rem',
              width: '18rem',
              height: '18rem',
              background: '#60a5fa',
              borderRadius: '50%',
              mixBlendMode: 'multiply',
              filter: 'blur(60px)',
              opacity: 0.2,
            }}
          ></div>
          <div
            className="position-absolute animate-blob animation-delay-2000"
            style={{
              top: '10rem',
              right: '2.5rem',
              width: '18rem',
              height: '18rem',
              background: '#22d3ee',
              borderRadius: '50%',
              mixBlendMode: 'multiply',
              filter: 'blur(60px)',
              opacity: 0.2,
            }}
          ></div>
          <div
            className="position-absolute animate-blob animation-delay-4000"
            style={{
              bottom: '-5rem',
              left: '50%',
              width: '18rem',
              height: '18rem',
              background: '#93c5fd',
              borderRadius: '50%',
              mixBlendMode: 'multiply',
              filter: 'blur(60px)',
              opacity: 0.2,
            }}
          ></div>
        </div>

        <div
          className={`position-relative bg-white rounded-4 shadow-lg w-100 overflow-hidden border border-light transition-all ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
          style={{ maxWidth: '960px', transitionDuration: '1000ms' }}
        >
          {/* Header */}
          <div
            className="position-relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
              padding: '3rem 2rem',
            }}
          >
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')",
                opacity: 0.3,
              }}
            ></div>

           <div className="position-relative d-flex flex-column flex-md-row align-items-center justify-content-center gap-4 gap-md-5">
  <div className="d-flex align-items-center gap-4 gap-md-5">
    <div className="bg-white bg-opacity-10 backdrop-blur p-3 p-md-4 rounded-3 border border-white border-opacity-25 shadow hover-scale">
      <div
        className="bg-white bg-opacity-90 rounded-2 d-flex align-items-center justify-content-center"
        style={{ height: '3rem', width: '8rem' }}
      ><a href="https://waterwise.co.za/">
      <img
          src="./waterwise.svg"
          alt="WaterWise logo"
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        /></a>
      </div>
    </div>

    <div
      className="vr bg-white opacity-25 d-none d-md-block"
      style={{ height: '4rem' }}
    ></div>

    <div className="bg-white bg-opacity-10 backdrop-blur p-3 p-md-4 rounded-3 border border-white border-opacity-25 shadow hover-scale">
      <div
        className="bg-white bg-opacity-90 rounded-2 d-flex align-items-center justify-content-center"
        style={{ height: '3rem', width: '8rem' }}
      ><a href="https://www.randwater.co.za/">
        <img
          src="./rand.svg"
          alt="Rand Water logo"
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        /></a>
      </div>
    </div>
  </div>
</div>
          </div>

          {/* Tips banner */}
          <div
            className="position-relative p-4 p-md-5 animate-gradient"
            style={{
              background:
                'linear-gradient(90deg, #0891b2, #06b6d4, #0891b2)',
              backgroundSize: '200% 100%',
            }}
          >
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="p-2 bg-white bg-opacity-25 rounded-2 backdrop-blur flex-shrink-0">
                <i className="bi bi-lightbulb-fill text-white fs-5"></i>
              </div>
              <div className="flex-grow-1">
                <div
                  className="text-white text-opacity-90 small fw-bold text-uppercase mb-1"
                  style={{ letterSpacing: '2px' }}
                >
                  CONSERVATION TIP #{currentTip + 1}
                </div>
                <p className="text-white fs-6 fw-medium mb-0 lh-base">
                  {waterTips[currentTip]}
                </p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-4 p-md-5">
            <div className="text-center mb-5">
              <h1 className="display-5 fw-bold mb-3 gradient-text">
Drop-by-Drop Water Conservation Survey              </h1>
              <p
                className="text-secondary fw-semibold text-uppercase small mb-3"
                style={{ letterSpacing: '2px' }}
              >
                Water Conservation Digital Survey Platform
              </p>
              <div className="d-flex align-items-center justify-content-center gap-2 text-muted small">
                <i className="bi bi-clock-history"></i>
                <span>Real-time household water monitoring</span>
              </div>
            </div>

            {/* Township cards */}
            <div className="mb-4">
              <label
                className="d-block small fw-bold text-secondary mb-3 text-uppercase"
                style={{ letterSpacing: '1px' }}
              >
                Select Township 
              </label>

              <div className="d-grid gap-3">
                {locations.map((loc, idx) => (
                  <Link href={loc.link} key={idx} className="text-decoration-none text-dark">
                    <div
                      className="location-card position-relative rounded-3 p-4 border border-2 overflow-hidden"
                      style={{
                        background:
                          'linear-gradient(90deg, #ffffff 0%, #f8fafc 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div className="position-relative d-flex align-items-center gap-3">
                        <div
                          className="location-icon p-3 rounded-3 shadow flex-shrink-0"
                          style={{
                            background:
                              'linear-gradient(135deg, #1e3a8a, #1e40af)',
                            transition: 'transform 0.3s',
                          }}
                        >
                          <i className="bi bi-geo-alt-fill text-white fs-4"></i>
                        </div>

                        <div className="flex-grow-1">
                          <h3 className="h5 fw-bold text-dark mb-1">
                            {loc.name}
                          </h3>
                          <div className="d-flex align-items-center gap-3 small">
                            <span className="text-secondary fw-medium">
                              {loc.households} Households
                            </span>
                            <span className="badge bg-success bg-opacity-25 text-success d-inline-flex align-items-center gap-1">
                              <span
                                className=""
                                style={{ width: '6px', height: '6px' }}
                              ></span>
                              {loc.status}
                            </span>
                          </div>
                        </div>

                        <div className="location-arrow text-secondary fs-4">
                          <i className="bi bi-arrow-right"></i>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Instruction box */}
            <div
              className="position-relative rounded-3 p-4 shadow-sm border-start border-4 border-info"
              style={{
                background: 'linear-gradient(90deg, #e0f2fe, #cffafe)',
              }}
            >
              <div className="d-flex gap-3">
                <div
                  className="p-2 bg-info bg-opacity-25 rounded-2 flex-shrink-0"
                  style={{ height: 'fit-content' }}
                >
                  <i className="bi bi-info-circle-fill text-info fs-5"></i>
                </div>
                <div>
                  <h4 className="fw-semibold text-dark mb-2 fs-6">
                    For Field Agents
                  </h4>
                  <p className="text-secondary small mb-0 lh-base">
                    Complete the survey form for each household during scheduled
                    visits. Ensure all required fields are accurately filled for
                    proper water usage tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="border-top p-4"
            style={{ background: 'linear-gradient(90deg, #f8fafc, #f1f5f9)' }}
          >
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
              <div className="small text-muted">
                © 2025 Drop-by-Drop Water Conservation Initiative
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="small text-secondary fw-medium">
                  Powered by
                </span>
                <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white border rounded-2 shadow-sm hover-shadow">
  <a href="https://www.brandscapersafrica.com/"><img
    src="/brandscaperlogo.png"
    className="rounded flex-shrink-0"
    style={{
      width: '24px',
      height: '24px',
    }}
    alt="Brandscapers Africa logo"
  />
  <span className="fw-bold text-dark">
    Brandscapers Africa
  </span></a>
</div>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded CSS animations */}
        <style jsx>{`
          @keyframes blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }

          @keyframes gradient {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animate-gradient {
            animation: gradient 6s ease infinite;
          }
          .pulse-dot {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .gradient-text {
            background: linear-gradient(90deg, #1e3a8a, #1e40af, #0891b2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
            /* Add these media queries at the end of your existing CSS */

/* Tablet devices (768px and below) */
@media (max-width: 768px) {
  .p-md-5 {
    padding: 1.5rem !important;
  }
  
  .display-5 {
    font-size: 2rem !important;
  }
  
  .fs-6 {
    font-size: 0.9rem !important;
  }
  
  /* Header adjustments */
  .position-relative.p-3.p-md-4 {
    padding: 2rem 1rem !important;
  }
  
  /* Logo container adjustments */
  .d-flex.align-items-center.gap-4.gap-md-5 {
    gap: 2rem !important;
  }
  
  /* Tips banner text */
  .text-white.fs-6.fw-medium {
    font-size: 0.9rem !important;
  }
  
  /* Location cards */
  .location-card {
    padding: 1.5rem !important;
  }
  
  .location-icon {
    padding: 0.75rem !important;
  }
  
  .location-icon .fs-4 {
    font-size: 1.25rem !important;
  }
}

/* Mobile devices (576px and below) */
@media (max-width: 576px) {
  .p-3.p-md-5 {
    padding: 1rem !important;
  }
  
  .p-4.p-md-5 {
    padding: 1.5rem 1rem !important;
  }
  
  .display-5 {
    font-size: 1.75rem !important;
    line-height: 1.3 !important;
  }
  
  /* Header section */
  .position-relative.overflow-hidden {
    padding: 2rem 1rem !important;
  }
  
  /* Logo layout for mobile */
  .d-flex.flex-column.flex-md-row {
    flex-direction: column !important;
  }
  
  .d-flex.align-items-center.gap-4.gap-md-5 {
    flex-direction: column !important;
    gap: 1.5rem !important;
  }
  
  .vr.d-none.d-md-block {
    display: none !important;
  }
  
  /* Tips banner */
  .position-relative.p-4.p-md-5 {
    padding: 1.5rem 1rem !important;
  }
  
  .d-flex.align-items-start.gap-3 {
    gap: 1rem !important;
  }
  
  /* Main content */
  .text-center.mb-5 {
    margin-bottom: 2rem !important;
  }
  
  /* Location cards mobile layout */
  .location-card .d-flex.align-items-center.gap-3 {
    gap: 1rem !important;
  }
  
  .location-icon {
    min-width: 50px;
  }
  
  .flex-grow-1 h3 {
    font-size: 1.1rem !important;
  }
  
  .flex-grow-1 .d-flex.align-items-center.gap-3 {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.5rem !important;
  }
  
  /* Instruction box */
  .d-flex.gap-3 {
    gap: 1rem !important;
  }
  
  /* Footer */
  .d-flex.flex-column.flex-md-row {
    text-align: center;
  }
  
  .d-flex.align-items-center.gap-3 {
    justify-content: center;
    flex-wrap: wrap;
  }
}

/* Small mobile devices (400px and below) */
@media (max-width: 400px) {
  .display-5 {
    font-size: 1.5rem !important;
  }
  
  .p-4.p-md-5 {
    padding: 1rem !important;
  }
  
  /* Header logos */
  .bg-white.bg-opacity-10 {
    padding: 1rem !important;
  }
  
  .bg-white.bg-opacity-90 {
    height: 2.5rem !important;
    width: 6rem !important;
  }
  
  /* Location cards */
  .location-card {
    padding: 1rem !important;
  }
  
  .location-card .d-flex.align-items-center.gap-3 {
    gap: 0.75rem !important;
  }
  
  .location-icon {
    padding: 0.5rem !important;
    min-width: 45px;
  }
  
  .location-icon .fs-4 {
    font-size: 1rem !important;
  }
  
  /* Reduce blob sizes on very small screens */
  .animate-blob {
    width: 12rem !important;
    height: 12rem !important;
  }
}

/* Landscape mode for mobile */
@media (max-height: 600px) and (orientation: landscape) {
  .min-vh-100 {
    min-height: auto !important;
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
  }
  
  .position-relative.bg-white.rounded-4 {
    max-height: 95vh;
    overflow-y: auto;
  }
}

/* High-resolution devices */
@media (min-width: 1400px) {
  .position-relative.bg-white.rounded-4 {
    max-width: 1200px !important;
  }
}

/* Print styles */
@media print {
  .animate-blob,
  .animate-gradient {
    animation: none !important;
    display: none !important;
  }
  
  .bg-white.bg-opacity-10 {
    background: white !important;
    color: black !important;
  }
}
        `}</style>
      </div>
    </>
  );
}
