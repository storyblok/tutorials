import { liteClient as algoliasearch } from 'algoliasearch/lite';
import {
  Hits,
  InstantSearch,
  RefinementList,
  SearchBox,
} from 'react-instantsearch';

const appId = import.meta.env.PUBLIC_ALGOLIA_APP_ID;
const apiKey = import.meta.env.PUBLIC_ALGOLIA_SEARCH_API_KEY;
const indexName = import.meta.env.PUBLIC_ALGOLIA_INDEX_NAME;
const searchClient = algoliasearch(appId, apiKey);

export default function SearchPage() {
  return (
    <InstantSearch searchClient={searchClient} indexName={indexName}>
      <SearchBox placeholder="Search articles, topics, or authors" />
      <RefinementList attribute="content.tags" />
      <Hits />
    </InstantSearch>
  );
}
