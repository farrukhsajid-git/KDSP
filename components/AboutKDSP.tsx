'use client';

export default function AboutKDSP() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          About KDSP
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              KDSP (Knowledge Development & Social Progress) is a pioneering organization dedicated to
              empowering communities through education, innovation, and social development. Since our
              inception, we have been at the forefront of creating meaningful change by bridging the
              gap between knowledge and action.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              Our mission is to foster sustainable development by providing access to quality education,
              promoting social entrepreneurship, and building inclusive communities. Through our various
              programs and initiatives, we have touched thousands of lives and continue to expand our
              reach to create lasting impact.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              Join us in our journey to build a better tomorrow. Together, we can create opportunities,
              inspire innovation, and drive positive change in communities around the world. Your support
              and participation make all the difference in achieving our shared vision of progress and
              prosperity for all.
            </p>
          </div>

          {/* Video Embed */}
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-xl">
              <iframe
                className="w-full h-full rounded-lg"
                style={{ aspectRatio: '16/9' }}
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="About KDSP"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center italic">
              Watch our story and learn more about our impact
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
