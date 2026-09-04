export default function ContactFormSection() {
  return (
    <section className="w-full bg-[#f5f5f5] py-8 sm:py-10 md:py-14 lg:py-16">
      <div className="container">
        <form className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-base font-semibold text-[#3a3a3a] sm:text-lg md:text-xl"
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="h-12 w-full rounded-xl border border-[#d6d6d6] bg-white px-4 text-base text-[#333] outline-none transition focus:border-[var(--brand)] sm:h-14 sm:rounded-2xl sm:text-lg md:h-16 md:text-xl"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-base font-semibold text-[#3a3a3a] sm:text-lg md:text-xl"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="h-12 w-full rounded-xl border border-[#d6d6d6] bg-white px-4 text-base text-[#333] outline-none transition focus:border-[var(--brand)] sm:h-14 sm:rounded-2xl sm:text-lg md:h-16 md:text-xl"
              />
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="email"
              className="mb-2 block text-base font-semibold text-[#3a3a3a] sm:text-lg md:text-xl"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="h-12 w-full rounded-xl border border-[#d6d6d6] bg-white px-4 text-base text-[#333] outline-none transition focus:border-[var(--brand)] sm:h-14 sm:rounded-2xl sm:text-lg md:h-16 md:text-xl"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="subject"
              className="mb-2 block text-base font-semibold text-[#3a3a3a] sm:text-lg md:text-xl"
            >
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              className="h-12 w-full rounded-xl border border-[#d6d6d6] bg-white px-4 text-base text-[#333] outline-none transition focus:border-[var(--brand)] sm:h-14 sm:rounded-2xl sm:text-lg md:h-16 md:text-xl"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="message"
              className="mb-2 block text-base font-semibold text-[#3a3a3a] sm:text-lg md:text-xl"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className="w-full rounded-xl border border-[#d6d6d6] bg-white px-4 py-3 text-base text-[#333] outline-none transition focus:border-[var(--brand)] sm:rounded-2xl sm:text-lg md:py-4 md:text-xl"
            />
          </div>

          <div className="mt-6 flex justify-center sm:mt-8">
            <button
              type="submit"
              className="min-w-30 rounded-full bg-[var(--brand)] px-8 py-2.5 text-base font-semibold text-white transition hover:opacity-90 sm:min-w-36 sm:px-10 sm:py-3 sm:text-lg md:text-xl"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
