import { setMuted, useMuted } from "../lib/sound";
import { useLocale } from "../i18n";

/** Speaker toggle for the joint sound; remembered in localStorage across tabs and visits. */
export function MuteToggle() {
  const { t } = useLocale();
  const muted = useMuted();
  return (
    <button
      type="button"
      aria-pressed={muted}
      aria-label={muted ? t("sound.unmute") : t("sound.mute")}
      onClick={() => setMuted(!muted)}
      className="pointer-events-auto grid size-9 place-items-center rounded-full text-ink sm:size-11 focus-visible:outline-[3px] focus-visible:-outline-offset-4 focus-visible:outline-ink"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" fillOpacity="0.12" />
        {muted ? (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        ) : (
          <>
            <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
            <path d="M18 6.8a7.4 7.4 0 0 1 0 10.4" />
          </>
        )}
      </svg>
    </button>
  );
}
