type Hit = {
  slug: string;
  name: string;
  content: {
    image?: {
      filename: string;
    };
    description?: string;
  };
};

interface HitProps {
  hit: Hit;
}

export default function Hit({ hit }: HitProps) {
  return (
    <article>
      <a href={`/${hit.slug}`} className="flex flex-wrap sm:flex-nowrap gap-4">
        {hit.content.image?.filename && (
          <img
            className="aspect-video w-48 h-auto object-cover rounded bg-gray-100"
            src={hit.content.image.filename}
            alt={hit.name}
            width={192}
            height={108}
            loading="lazy"
          />
        )}
        <div className="content">
          <h2 className="font-semibold text-xl">{hit.name}</h2>
          <p>{hit.content.description}</p>
        </div>
      </a>
    </article>
  );
}
