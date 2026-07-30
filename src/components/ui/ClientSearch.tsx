"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ShoppingBag, FolderTree } from 'lucide-react';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import styles from './ClientSearch.module.css';
import { useLocale } from 'next-intl';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  price?: number;
  salePrice?: number;
  category?: string;
  image?: string;
  link: string;
}

export default function ClientSearch() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useCurrency();
  const router = useRouter();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
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
      if (query.trim().length === 0) setResults([]);
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
        const res = await fetch(`/api/search/client?q=${encodeURIComponent(query)}`);
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
      if (!isOpen) return;
      
      const hasResults = results.length > 0;
      // We add + 1 to length to account for the "View All Results" button at the bottom
      const totalItems = hasResults ? results.length + 1 : 0;
      
      if (e.key === 'ArrowDown' && totalItems > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp' && totalItems > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (hasResults && selectedIndex < results.length) {
          const selected = results[selectedIndex];
          if (selected) {
            router.push(selected.link);
            setIsOpen(false);
          }
        } else if (query.trim().length > 0) {
          // If "View All" is selected or no specific result is selected but there is a query
          router.push(`/shop?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, query, router]);

  const handleSelect = (link: string) => {
    router.push(link);
    setIsOpen(false);
  };

  return (
    <>
      <div 
        className={styles.searchTrigger} 
        onClick={() => setIsOpen(true)}
      >
        <Search size={18} className={styles.searchIcon} />
        <span className={styles.searchText}>{isAr ? 'بحث...' : 'Search...'}</span>
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
                placeholder={isAr ? 'البحث عن المنتجات والفئات...' : 'Search products and categories...'}
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
                      {result.type === 'Product' ? (
                        <>
                          <div className={styles.productImageWrapper}>
                            {result.image ? (
                              <img src={result.image} alt={result.title} className={styles.productImage} />
                            ) : (
                              <div className={styles.productImageFallback}><ShoppingBag size={20} /></div>
                            )}
                          </div>
                          <div className={styles.resultContent}>
                            <div className={styles.resultTitle}>{result.title}</div>
                            <div className={styles.resultSubtitle}>
                              {result.category && <span>{result.category}</span>}
                              {result.price !== undefined && (
                                <span className={styles.price}>
                                  {result.salePrice ? (
                                    <>
                                      <span className={styles.oldPrice}>{formatPrice(result.price)}</span>
                                      <span className={styles.salePrice}>{formatPrice(result.salePrice)}</span>
                                    </>
                                  ) : (
                                    <span>{formatPrice(result.price)}</span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={styles.categoryIconWrapper}>
                            <FolderTree size={16} />
                          </div>
                          <div className={styles.resultContent}>
                            <div className={styles.resultTitle}>{result.title}</div>
                            <div className={styles.resultSubtitle}>{isAr ? 'فئة' : 'Category'}</div>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                  <li 
                    className={`${styles.viewAllBtn} ${selectedIndex === results.length ? styles.selectedViewAll : ''}`}
                    onClick={() => handleSelect(`/shop?q=${encodeURIComponent(query)}`)}
                    onMouseEnter={() => setSelectedIndex(results.length)}
                  >
                    {isAr ? `عرض جميع النتائج لـ "${query}" \u2190` : `View all results for "${query}" \u2192`}
                  </li>
                </ul>
              ) : query.length >= 2 && !isLoading ? (
                <div className={styles.emptyState}>{isAr ? `لم يتم العثور على منتجات لـ "${query}"` : `No products found for "${query}"`}</div>
              ) : (
                <div className={styles.helperText}>
                  {isAr ? 'اكتب حرفين على الأقل للبحث في الكتالوج.' : 'Type at least 2 characters to search the catalog.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
