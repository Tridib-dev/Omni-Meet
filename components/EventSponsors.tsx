import Image from 'next/image';
import Link from 'next/link';

interface Sponsor {
  name: string;
  logo?: string;
  website?: string;
}

const EventSponsors = ({ sponsors }: { sponsors: Sponsor[] }) => {
  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-semibold mb-8">Sponsored By</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sponsors.map((sponsor, index) => (
          <Link
            key={index}
            href={sponsor.website || '#'}
            target="_blank"
            className="group bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 p-8 rounded-3xl transition-all flex flex-col items-center justify-center text-center"
          >
            {sponsor.logo && (
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={140}
                height={70}
                className="mb-6 opacity-80 group-hover:opacity-100 transition"
              />
            )}
            <p className="font-medium text-white text-lg">{sponsor.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EventSponsors;