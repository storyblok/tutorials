import {
  useRefinementList,
  type UseRefinementListProps,
} from 'react-instantsearch';

export default function CustomRefinementList(props: UseRefinementListProps) {
  const { items, refine } = useRefinementList(props);

  return (
    <div className="flex flex-wrap gap-2 my-8">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => refine(item.value)}
          className={`rounded-xl border px-3 py-1 transition capitalize ${
            item.isRefined
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-800 hover:bg-blue-100 border-gray-300'
          }`}
        >
          {item.label}{' '}
          <span className="ml-1 text-xs text-gray-500">({item.count})</span>
        </button>
      ))}
    </div>
  );
}
