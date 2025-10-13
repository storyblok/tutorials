import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Hits, InstantSearch, SearchBox } from 'react-instantsearch';
import Hit from './Hit';
import CustomRefinementList from './CustomRefinementList';
const appId = import.meta.env.PUBLIC_ALGOLIA_APP_ID;
const apiKey = import.meta.env.PUBLIC_ALGOLIA_SEARCH_API_KEY;
const indexName = import.meta.env.PUBLIC_ALGOLIA_INDEX_NAME;
const searchClient = algoliasearch(appId, apiKey);

export default function SearchPage() {
  return (
    <div className="max-w-screen-md mx-auto">
      <InstantSearch searchClient={searchClient} indexName={indexName}>
        <SearchBox
          placeholder="Search articles, topics, or authors"
          classNames={{
            input:
              'border rounded focus:outline-none w-full p-2 focus:ring-4 focus:border-blue-600 ring-blue-500/50',
            form: 'flex gap-2 my-6',
            submitIcon: 'text-white fill-current',
            submit: 'bg-gray-800 px-4 rounded-lg',
          }}
        />
        {/* <RefinementList attribute="content.tags" /> */}
        <CustomRefinementList attribute="content.tags" />
        <Hits hitComponent={Hit} />
      </InstantSearch>
    </div>
  );
}
