"use client";

import React from 'react';
import styles from './Table.module.css';

// --- Low-level primitives ---

export function Table({ className = '', children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className={styles.tableWrapper}>
      <table className={`${styles.table} ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className = '', children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`${styles.tr} ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className = '', children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`${styles.th} ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className = '', children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`${styles.td} ${className}`} {...props}>
      {children}
    </td>
  );
}

// --- High-level DataTable (columns + data props) ---

export interface DataTableColumn {
  key: string;
  label: string;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: Record<string, React.ReactNode>[];
  onRowClick?: (row: Record<string, React.ReactNode>) => void;
}

export function DataTable({ columns, data, onRowClick }: DataTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={styles.th}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.td} style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '32px' }}>
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className={styles.tr}
                onClick={() => onRowClick?.(row)}
                style={{ cursor: onRowClick ? 'pointer' : undefined }}
              >
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
