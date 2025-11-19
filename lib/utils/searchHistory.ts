const SEARCH_HISTORY_KEY = "search_history";
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  filters?: Record<string, any>;
}

export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

export function addToSearchHistory(
  query: string,
  filters?: Record<string, any>
): void {
  if (typeof window === "undefined") return;
  
  try {
    const history = getSearchHistory();
    const newItem: SearchHistoryItem = {
      query,
      timestamp: Date.now(),
      filters,
    };

    // Remove duplicate queries
    const filtered = history.filter((item) => item.query !== query);
    
    // Add new item at the beginning
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore errors
  }
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    // Ignore errors
  }
}

export function removeFromSearchHistory(query: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const history = getSearchHistory();
    const updated = history.filter((item) => item.query !== query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore errors
  }
}


