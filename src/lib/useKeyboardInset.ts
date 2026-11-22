import { useEffect, useState } from "react";

/**
 * Koliko je piksela dna ekrana zaklonjeno tipkovnicom.
 *
 * Na iOS-u i Androidu tipkovnica ne smanjuje layout viewport, samo vizualni,
 * pa element s `bottom: 0` ostane iza nje. Sheet s inputom zato treba podići
 * za ovaj iznos. Kod pinch-zooma (scale > 1) vizualni viewport je također
 * manji, ali to nije tipkovnica — tada vraćamo 0.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const hidden = window.innerHeight - vv.height - vv.offsetTop;
      setInset(vv.scale > 1.01 ? 0 : Math.max(0, Math.round(hidden)));
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}
