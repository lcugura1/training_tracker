interface ShameBannerProps {
  time: string;
  message: string;
}

export function ShameBanner({ time, message }: ShameBannerProps) {
  return (
    <section className="shame" role="alert">
      <span className="shame__dot" aria-hidden="true" />
      <p className="shame__text">
        {time} je. {message}
      </p>
    </section>
  );
}
