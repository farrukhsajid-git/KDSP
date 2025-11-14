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
              <strong>Karachi Down Syndrome Program (KDSP)</strong> empowers individuals with Down syndrome in Pakistan
              through quality developmental services. Founded in 2014 by concerned parents and professionals, we serve
              a 1,700+ strong network across Pakistan and internationally.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              <strong>Our Mission:</strong> Provide one-stop access to affordable developmental services while advocating
              for inclusion in mainstream society. Through our KASHTI model (Family Support, Awareness, Healthcare,
              Skills Development, Education, and Early Intervention), we ensure finances never hinder access—94% of
              families receive financial support.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              <strong>Our Impact:</strong> 260+ family support sessions, 15,000+ hearts reached through awareness,
              850+ surgeries facilitated, 410+ individuals in skills programs, 265+ teachers trained, and 600+ weekly
              early intervention sessions.
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
