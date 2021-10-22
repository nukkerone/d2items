import { debounce } from 'lodash';
import React, { useMemo, useState } from 'react';

function SearchInput({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchHandler = useMemo(
    () => debounce(onSearch, 300)
    , []);
  
  const doSearch = (e) => {
    setSearchQuery(e.target.value);
    debouncedSearchHandler(e.target.value);
  }
  
  const clearSearch = (e) => {
    e.preventDefault();
    setSearchQuery('');
    onSearch('');
  }

  return (
    <div className="mb-3" id="search-wrapper">
      <input type="text" className="form-control" id="search" placeholder="Type to search" onChange={doSearch} value={searchQuery} />
      { searchQuery &&
        <button id="search-clear" onClick={clearSearch}></button>
      }
    </div>
  )
}

export default SearchInput;
