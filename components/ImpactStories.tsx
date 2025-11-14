'use client';

import Image from 'next/image';

const stories = [
  {
    id: 1,
    name: 'Ayesha K.',
    title: 'Parent & Family Support Advocate',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    story: 'KDSP gave us hope when we felt alone. Through family support sessions, we connected with other parents and learned how to help our daughter thrive. Today she attends mainstream school!',
  },
  {
    id: 2,
    name: 'Ahmed R.',
    title: 'KDSP Skills Program Graduate',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    story: 'The skills development program at KDSP taught me valuable life and work skills. I now work part-time at a local café and feel included in my community.',
  },
  {
    id: 3,
    name: 'Sarah M.',
    title: 'Teacher & KDSP Volunteer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    story: 'KDSP\'s teacher training transformed how I work with students with Down syndrome. The inclusive education techniques I learned benefit all my students.',
  },
];

export default function ImpactStories() {
  return (
    <section id="impact" className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Impact Stories
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Real stories from real people whose lives have been transformed through our programs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl group"
            >
              {/* Image */}
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={story.image}
                  alt={story.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed mb-4 italic">
                  &ldquo;{story.story}&rdquo;
                </p>
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {story.name}
                  </h3>
                  <p className="text-sm text-gray-600">{story.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
