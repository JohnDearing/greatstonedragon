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
          <h2>My Story</h2>
          <p>
            My love for pin collecting started completely unexpectedly during a
            weekend trip to Disneyland with my husband and daughter.
          </p>
          <p>
            Our very first purchase was a Marvel mystery pack with five pins
            inside. I still remember looking at the price and thinking, “$45 for
            five pins?!” At the time, I had no idea that one little mystery pack
            was about to send me down such a huge rabbit hole.
          </p>
          <p>
            Once I started discovering just how much there was to the pin
            collecting hobby, I was hooked. I began learning about different
            releases, characters, collections, trading, limited editions, and
            all of the little details that make pins so much fun to collect.
            Like many collectors, I started out wanting to collect just about
            every character I loved.
          </p>
          <p>
            Over time, my collections became much more focused. Today, I am an
            Elemental completist, and Mulan and Baymax are two of my other main
            collections. My husband and I also share a collection, although I
            will admit it is mostly his, centered around Star Tours and Star
            Wars, especially The Clone Wars.
          </p>
          <p>
            His collection has also grown into a fun mix of characters and
            styles that he simply enjoys. He loves Scrooge McDuck, Genie,
            interactive pins with features like spinners and sliders, and pretty
            much anything involving animals. Because of that, our collection as
            a whole has become a little bit of everything, and I think that is
            part of what makes collecting so fun.
          </p>
          <p>
            As I continued deeper into the hobby, my collecting style naturally
            changed. I eventually narrowed down some of the larger collections I
            had built over the years, including Beauty and the Beast and Raya
            and the Last Dragon, and started focusing more on the characters and
            stories that meant the most to me.
          </p>
          <p>
            That was also when I began noticing something that would eventually
            inspire Great Stone Dragon.
          </p>
          <p>
            There are so many characters, movies, and collections that do not
            always get the attention they deserve. Disney has an enormous world
            of characters to celebrate, and naturally, not every favorite can be
            represented all the time. Sometimes even characters from my own main
            collections would go long periods without new designs, while other
            characters I loved might hardly appear at all.
          </p>
          <p>
            That gap is what first drew me toward the world of fantasy pins.
          </p>
          <p>
            I fell in love with the creativity behind them. Fantasy pins offered
            the opportunity to explore characters and moments in completely
            different ways, while also incorporating beautiful details and
            effects that I had grown to love as a collector. Glitter, pearl,
            translucent elements, different plating finishes, movement, and
            unique concepts opened up an entirely new creative world for me.
          </p>
          <p>
            Eventually, I decided I wanted to create the kinds of pins I had
            been searching for myself.
          </p>

          <h2>The Beginning of Great Stone Dragon</h2>
          <p>
            My first series was <em>Enchanted Doorways</em>, beginning with
            Mulan and Belle.
          </p>
          <p>
            At the time, I could never have imagined how much Great Stone Dragon
            would grow from those first designs. What started with a few ideas
            inspired by characters I personally loved has expanded into multiple
            collections and series, each giving me another opportunity to
            explore new concepts and celebrate different parts of fandom.
          </p>
          <p>
            One of those ideas eventually became <em>First Class Postage</em>,
            which has now grown to more than 160 designs.
          </p>
          <p>
            Seeing a single series grow to that scale has been incredibly
            special, especially knowing that each design represents a character,
            story, or favorite that someone may have been waiting to see
            celebrated.
          </p>
          <p>
            And First Class Postage is only one part of what Great Stone Dragon
            has become. I have continued developing new series, revisiting older
            concepts, experimenting with different effects, and introducing new
            ideas as the brand grows.
          </p>

          <h2>What Great Stone Dragon Means to Me</h2>
          <p>
            Great Stone Dragon is a place for collectors who find magic in the
            characters and stories beyond the spotlight.
          </p>
          <p>
            Every fantasy pin begins with an idea and is thoughtfully developed
            in collaboration with independent artists. I stay involved throughout
            the creative process, from the initial concept and artwork to
            choosing colors, finishes, plating, glitter, pearl, and all of the
            tiny details that bring a design to life.
          </p>
          <p>
            Being a collector first has shaped nearly every part of the way I
            create.
          </p>
          <p>
            I know the excitement of seeing one of your favorite characters
            finally represented. I know what it feels like to hunt for the
            perfect piece for your collection, discover a design you have never
            seen before, or find a pin that immediately feels like it belongs on
            your board.
          </p>
          <p>
            That is the feeling I hope to create through Great Stone Dragon.
          </p>
          <p>
            For me, this brand has become so much more than a pin shop. It is a
            way to celebrate fandom, creativity, overlooked favorites, and the
            characters that mean something to each of us.
          </p>
          <p>
            From one Marvel mystery pack at Disneyland to hundreds of designs
            finding homes in collections around the world, this journey has
            grown into something I never could have imagined when I bought those
            first five pins.
          </p>
          <p>And there is still so much more I want to create.</p>
          <p>
            As Great Stone Dragon continues to grow, I cannot wait to introduce
            new series, explore new ideas, and continue watching these designs
            become part of your collections.
          </p>
          <p className="about-story-quote">
            Thank you for allowing something that began as my own love of
            collecting to become something I get to share with all of you.
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
