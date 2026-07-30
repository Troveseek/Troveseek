"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, User, Package, ShoppingCart, MessageSquare } from 'lucide-react';
import styles from './AdminCommandPalette.module.css';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  link: string;
}

export default function AdminCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Search effect with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/admin?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(0); // Reset selection
        }
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard navigation in results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          router.push(selected.link);
          setIsOpen(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, router]);

  const handleSelect = (link: string) => {
    router.push(link);
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'User': return <User size={16} />;
      case 'Product': return <Package size={16} />;
      case 'Order': return <ShoppingCart size={16} />;
      case 'Ticket': return <MessageSquare size={16} />;
      default: return <Search size={16} />;
    }
  };

  return (
    <>
      <div 
        className={styles.searchTrigger} 
        onClick={() => setIsOpen(true)}
      >
        <Search size={16} className={styles.searchIcon} />
        <span className={styles.searchText}>Search...</span>
        <kbd className={styles.shortcut}>⌘K</kbd>
      </div>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.inputWrapper}>
              <Search size={20} className={styles.modalSearchIcon} />
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                placeholder="Search users, products, orders..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {isLoading && <Loader2 size={18} className={styles.spinner} />}
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.resultsContainer}>
              {results.length > 0 ? (
                <ul className={styles.resultsList}>
                  {results.map((result, idx) => (
                    <li 
                      key={result.id} 
                      className={`${styles.resultItem} ${idx === selectedIndex ? styles.selected : ''}`}
                      onClick={() => handleSelect(result.link)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div className={styles.resultIconWrapper}>
                        {getIcon(result.type)}
                      </div>
                      <div className={styles.resultContent}>
                        <div className={styles.resultTitle}>{result.title}</div>
                        <div className={styles.resultSubtitle}>{result.subtitle}</div>
                      </div>
                      <div className={styles.resultType}>{result.type}</div>
                    </li>
                  ))}
                </ul>
              ) : query.length >= 2 && !isLoading ? (
                <div className={styles.emptyState}>No results found for "{query}"</div>
              ) : (
                <div className={styles.helperText}>
                  Type at least 2 characters to search across the database.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
