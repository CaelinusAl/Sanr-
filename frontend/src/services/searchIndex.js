/**
 * Search Index Service for CineCursor
 * Fast fuzzy search for assets, scenes, and characters using Fuse.js
 */

import Fuse from 'fuse.js';

class SearchIndex {
  constructor() {
    this.scenesIndex = null;
    this.charactersIndex = null;
    this.assetsIndex = null;
    this.allIndex = null;
    
    // Fuse.js options for optimal search
    this.fuseOptions = {
      includeScore: true,
      includeMatches: true,
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.2 },
        { name: 'prompt', weight: 0.2 },
        { name: 'tags', weight: 0.2 }
      ]
    };
  }

  /**
   * Initialize/rebuild all indexes
   */
  buildIndexes(data) {
    const { scenes = [], characters = [], assets = [] } = data;
    
    // Build individual indexes
    this.scenesIndex = new Fuse(
      scenes.map(s => ({ ...s, type: 'scene' })),
      this.fuseOptions
    );
    
    this.charactersIndex = new Fuse(
      characters.map(c => ({ ...c, type: 'character' })),
      {
        ...this.fuseOptions,
        keys: [
          { name: 'name', weight: 0.5 },
          { name: 'description', weight: 0.3 },
          { name: 'traits', weight: 0.2 }
        ]
      }
    );
    
    this.assetsIndex = new Fuse(
      assets.map(a => ({ ...a, type: 'asset' })),
      {
        ...this.fuseOptions,
        keys: [
          { name: 'name', weight: 0.4 },
          { name: 'filename', weight: 0.3 },
          { name: 'tags', weight: 0.3 }
        ]
      }
    );
    
    // Build combined index for global search
    const allItems = [
      ...scenes.map(s => ({ ...s, type: 'scene' })),
      ...characters.map(c => ({ ...c, type: 'character' })),
      ...assets.map(a => ({ ...a, type: 'asset' }))
    ];
    
    this.allIndex = new Fuse(allItems, {
      ...this.fuseOptions,
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.2 },
        { name: 'prompt', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
        { name: 'filename', weight: 0.1 }
      ]
    });
  }

  /**
   * Search across all types
   */
  searchAll(query, limit = 20) {
    if (!query || !this.allIndex) return [];
    
    const results = this.allIndex.search(query, { limit });
    return this._formatResults(results);
  }

  /**
   * Search only scenes
   */
  searchScenes(query, limit = 10) {
    if (!query || !this.scenesIndex) return [];
    
    const results = this.scenesIndex.search(query, { limit });
    return this._formatResults(results);
  }

  /**
   * Search only characters
   */
  searchCharacters(query, limit = 10) {
    if (!query || !this.charactersIndex) return [];
    
    const results = this.charactersIndex.search(query, { limit });
    return this._formatResults(results);
  }

  /**
   * Search only assets
   */
  searchAssets(query, limit = 10) {
    if (!query || !this.assetsIndex) return [];
    
    const results = this.assetsIndex.search(query, { limit });
    return this._formatResults(results);
  }

  /**
   * Search with filters
   */
  searchWithFilters(query, filters = {}) {
    const { type, status, minDuration, maxDuration } = filters;
    
    let results = this.searchAll(query, 50);
    
    // Apply filters
    if (type) {
      results = results.filter(r => r.type === type);
    }
    
    if (status) {
      results = results.filter(r => r.status === status);
    }
    
    if (minDuration !== undefined) {
      results = results.filter(r => (r.duration || 0) >= minDuration);
    }
    
    if (maxDuration !== undefined) {
      results = results.filter(r => (r.duration || Infinity) <= maxDuration);
    }
    
    return results;
  }

  /**
   * Get suggestions for autocomplete
   */
  getSuggestions(query, limit = 5) {
    if (!query || query.length < 2) return [];
    
    const results = this.searchAll(query, limit);
    return results.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      score: r.score
    }));
  }

  /**
   * Add item to index
   */
  addItem(item, type) {
    const indexMap = {
      scene: this.scenesIndex,
      character: this.charactersIndex,
      asset: this.assetsIndex
    };
    
    const index = indexMap[type];
    if (index) {
      // Fuse.js doesn't have direct add, so we need to rebuild
      // For better performance, we could use a different approach
      const collection = index.getIndex().docs || [];
      collection.push({ ...item, type });
      index.setCollection(collection);
      
      // Also update all index
      if (this.allIndex) {
        const allCollection = this.allIndex.getIndex().docs || [];
        allCollection.push({ ...item, type });
        this.allIndex.setCollection(allCollection);
      }
    }
  }

  /**
   * Remove item from index
   */
  removeItem(itemId, type) {
    const indexMap = {
      scene: this.scenesIndex,
      character: this.charactersIndex,
      asset: this.assetsIndex
    };
    
    const index = indexMap[type];
    if (index) {
      const collection = (index.getIndex().docs || []).filter(d => d.id !== itemId);
      index.setCollection(collection);
      
      // Also update all index
      if (this.allIndex) {
        const allCollection = (this.allIndex.getIndex().docs || []).filter(d => d.id !== itemId);
        this.allIndex.setCollection(allCollection);
      }
    }
  }

  /**
   * Update item in index
   */
  updateItem(item, type) {
    this.removeItem(item.id, type);
    this.addItem(item, type);
  }

  /**
   * Format search results
   */
  _formatResults(results) {
    return results.map(r => ({
      ...r.item,
      score: r.score,
      matches: r.matches?.map(m => ({
        key: m.key,
        value: m.value,
        indices: m.indices
      }))
    }));
  }

  /**
   * Get index stats
   */
  getStats() {
    return {
      scenes: this.scenesIndex?.getIndex().docs?.length || 0,
      characters: this.charactersIndex?.getIndex().docs?.length || 0,
      assets: this.assetsIndex?.getIndex().docs?.length || 0,
      total: this.allIndex?.getIndex().docs?.length || 0
    };
  }

  /**
   * Clear all indexes
   */
  clear() {
    this.scenesIndex = null;
    this.charactersIndex = null;
    this.assetsIndex = null;
    this.allIndex = null;
  }
}

// Singleton instance
let instance = null;

export function getSearchIndex() {
  if (!instance) {
    instance = new SearchIndex();
  }
  return instance;
}

// React hook for search
export function useSearch(query, options = {}) {
  const [results, setResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const searchIndex = getSearchIndex();
  
  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      const searchResults = options.type
        ? searchIndex.searchWithFilters(query, options)
        : searchIndex.searchAll(query);
      
      setResults(searchResults);
      setIsSearching(false);
    }, 150);
    
    return () => clearTimeout(timeoutId);
  }, [query, options.type]);
  
  return { results, isSearching };
}

export default SearchIndex;

import React from 'react';
