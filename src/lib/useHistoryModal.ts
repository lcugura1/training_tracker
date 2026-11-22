import { useCallback, useEffect, useState } from "react";

/**
 * Stanje otvorenog modala vezano uz povijest preglednika, pa Android/browser
 * "natrag" zatvara modal umjesto da napusti aplikaciju.
 *
 * Svako zatvaranje ide preko history.back(): popstate onda zatvara modal, a
 * ulaz koji smo gurnuli pri otvaranju ne ostaje visjeti u povijesti.
 * pushState je namjerno u rukovatelju otvaranja, ne u efektu — StrictMode bi
 * efekt pokrenuo dvaput i modal bi se zatvorio sam od sebe.
 */
export function useHistoryModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const show = useCallback(() => {
    history.pushState({ modal: true }, "");
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    if (history.state?.modal) history.back();
    else setOpen(false);
  }, []);

  return { open, show, hide };
}
