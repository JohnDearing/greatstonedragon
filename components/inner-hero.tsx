interface InnerHeroProps {
  title: string;
  description: string;
}

const InnerHero = ({ title, description }: InnerHeroProps) => {
  const backgroundImageUrl = "/images/about/about-bg.png";

  return (
    <section
      className="relative -mt-33 flex min-h-[380px] w-full items-center justify-center bg-cover bg-center px-4 py-20 md:-mt-33 md:min-h-[460px] md:px-6 md:py-28 lg:-mt-33 lg:min-h-[562px] lg:py-32"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="mx-auto max-w-4xl translate-y-10 text-center sm:translate-y-0">
        <h1 className="text-5xl font-bold leading-tight text-[var(--text)] sm:text-6xl md:text-7xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[var(--text)] sm:text-lg md:mt-5 md:text-2xl">
          {description}
        </p>
      </div>
    </section>
  );
};

export default InnerHero;