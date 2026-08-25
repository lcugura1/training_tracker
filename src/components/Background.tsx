/**
 * Podloga koju staklo lomi: tri mekana kruga svjetla, vignette i zrno.
 * Krugovi se pomiču isključivo preko `transform`, pa cijela animacija ostaje
 * na compositoru. Ovdje žive i oba SVG filtera za cijelu aplikaciju.
 */
export function Background() {
  return (
    <>
      <div className="bg" aria-hidden="true">
        <div className="bg__orb bg__orb--1" />
        <div className="bg__orb bg__orb--2" />
        <div className="bg__orb bg__orb--3" />
        <div className="bg__vignette" />
        <div className="bg__grain" />
      </div>

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="liquid-refraction" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.014"
            numOctaves="2"
            seed="7"
            result="n"
          />
          <feGaussianBlur in="n" stdDeviation="2" result="s" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="s"
            scale="16"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
    </>
  );
}
