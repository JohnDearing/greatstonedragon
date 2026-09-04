import Image from "next/image";

const stats = [
  { value: "3,000+", label: "Collectors" },
  { value: "150+", label: "Pin Designs" },
  { value: "48hr", label: "Ship Time" },
];

const commitments = [
  {
    title: "Careful Packaging",
    text: "Every order is bubble-wrapped and protected before it leaves our hands.",
  },
  {
    title: "Fast Dispatch",
    text: "In stock items ship within 48 hours of receiving your order.",
  },
  {
    title: "Preorder Guarantee",
    text: "Every preorder is guaranteed. Unfulfillable orders receive an immediate full refund.",
  },
  {
    title: "Always Open",
    text: "Our DMs and contact line are always open for questions, updates, or just to say hi.",
  },
];

const TheStory = () => {
  return (
    <section className="about-story-section">
      <div className="container about-story-layout">
        <aside className="about-story-media-col" aria-label="Studio highlights">
          <div className="about-story-media">
            <Image
              src="/images/about/story.png"
              alt="Great Stone Dragon studio story visual"
              width={1080}
              height={780}
              className="about-story-media-img"
              priority
            />
          </div>

          <div className="about-story-stats">
            {stats.map((item) => (
              <div key={item.label} className="about-story-stat">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </aside>
        <div className="about-story-content">
          <h2>The Story</h2>
          <p>
            Great Stone Dragon began with a single obsession: Disney pin
            trading. What started as a hobby grew into something far more
            personal a mission to create the pins that the mainstream never
            made. Every design in this shop is born from a love for characters
            and stories that often do not get the love and attention they
            deserve. The overlooked heroes, the underrated villains, the beloved
            sidekicks who never quite made it onto official merchandise. Each
            fantasy pin is commissioned directly from talented artists, funded
            out of pocket, and manufactured through a meticulous nine-stage
            process that ensures every piece meets collector-grade standards.
          </p>
          <p className="about-story-quote">
            &quot;Welcome to the journey and thank you for supporting my small
            shop!&quot;
          </p>

          <h3>Our Commitments</h3>
          <ul className="about-story-commitments">
            {commitments.map((item) => (
              <li key={item.title}>
                <span className="about-story-check" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TheStory;
