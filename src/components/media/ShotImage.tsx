import { shotSrcSet, shotStem, shotUrl, type Shot } from "@/lib/aselius-media";

type ShotImageProps = {
  shot: Shot;
  className?: string;
  sizes?: string;
  /** Load immediately (above the fold). Everything else is lazy. */
  priority?: boolean;
  alt?: string;
};

/**
 * A real Aselius screenshot that follows the site theme: when the frame exists
 * in both themes, the light one shows on canvas and the dark one on charcoal.
 * The hidden one is display:none and lazy, so browsers never download it.
 * Width and height are set so the layout never shifts while it loads.
 */
export function ShotImage({ shot, className = "", sizes = "(min-width: 1024px) 60vw, 100vw", priority, alt }: ShotImageProps) {
  const label = alt ?? shot.caption;
  const common = {
    width: shot.w,
    height: shot.h,
    sizes,
    decoding: "async" as const,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    draggable: false,
  };

  if (shot.light && shot.dark) {
    const light = shotStem(shot, "light");
    const dark = shotStem(shot, "dark");
    return (
      <>
        <img
          {...common}
          src={shotUrl(light)}
          srcSet={shotSrcSet(shot, light)}
          alt={label}
          className={`${className} dark:hidden`}
        />
        <img
          {...common}
          loading="lazy"
          src={shotUrl(dark)}
          srcSet={shotSrcSet(shot, dark)}
          alt={label}
          className={`${className} hidden dark:block`}
        />
      </>
    );
  }

  const stem = shotStem(shot, "light");
  return (
    <img
      {...common}
      src={shotUrl(stem)}
      srcSet={shotSrcSet(shot, stem)}
      alt={label}
      className={className}
    />
  );
}
