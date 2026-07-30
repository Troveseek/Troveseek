"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import styles from './UploadZone.module.css';

interface UploadZoneProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
}

export function UploadZone({ 
  onFileSelect, 
  accept, 
  multiple = false,
  title = 'Drag & drop files here',
  subtitle = 'or click to browse from your computer'
}: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      className={`${styles.uploadZone} ${dragActive ? styles.dragActive : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input 
        ref={inputRef}
        type="file" 
        className={styles.input} 
        onChange={handleChange}
        accept={accept}
        multiple={multiple}
      />
      <div className={styles.iconWrapper}>
        <UploadCloud size={32} />
      </div>
      <div>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}
