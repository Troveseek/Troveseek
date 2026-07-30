"use client";

import React, { useState } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ items, defaultTabId, onChange, className = '' }: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || (items.length > 0 ? items[0].id : ''));

  const handleTabClick = (id: string) => {
    setActiveTabId(id);
    if (onChange) {
      onChange(id);
    }
  };

  const activeContent = items.find((item) => item.id === activeTabId)?.content;

  return (
    <div className={`${styles.tabsWrapper} ${className}`}>
      <div className={styles.tabList} role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeTabId === item.id}
            aria-controls={`panel-${item.id}`}
            id={`tab-${item.id}`}
            className={`${styles.tab} ${activeTabId === item.id ? styles.active : ''}`}
            onClick={() => handleTabClick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div 
        className={styles.tabContent}
        role="tabpanel"
        id={`panel-${activeTabId}`}
        aria-labelledby={`tab-${activeTabId}`}
      >
        {activeContent}
      </div>
    </div>
  );
}
