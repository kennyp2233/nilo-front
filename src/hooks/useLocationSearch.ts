// hooks/useLocationSearch.ts
import { useState, useCallback } from "react";
import { debounce } from "lodash";
import { LocationService } from "@/src/services/location.service";

export function useLocationSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      const results = await LocationService.searchLocations(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 500),
    []
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    debouncedSearch(query);
  };

  const resetSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  return { searchQuery, searchResults, isSearching, handleSearch, resetSearch };
}
