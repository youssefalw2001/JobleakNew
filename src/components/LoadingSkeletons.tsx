/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

// Base Skeleton Component
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-800/50 rounded ${className}`} />
);

// Card Skeleton
export const CardSkeleton: React.FC = () => (
  <div className="bento-card p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-8 w-24" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  </div>
);

// Dashboard Metrics Skeleton
export const MetricsGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bento-card p-5 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-full" />
      </div>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4 pb-3 border-b border-slate-800">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 py-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))}
  </div>
);

// Radar Loading Skeleton
export const RadarSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    {/* Left Column */}
    <div className="lg:col-span-4 space-y-6">
      <div className="bento-card p-6 space-y-4">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="w-44 h-44 mx-auto">
          <Skeleton className="w-full h-full rounded-full" />
        </div>
        <Skeleton className="h-3 w-full" />
      </div>
      
      <CardSkeleton />
      <CardSkeleton />
    </div>

    {/* Right Column */}
    <div className="lg:col-span-8 space-y-6">
      <div className="bento-card p-8 space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/50 p-4 rounded-xl space-y-3">
              <Skeleton className="h-8 w-16 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-4/5 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="bento-card p-8 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC = () => (
  <div className="bento-card p-8 space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
    
    <div className="flex justify-end pt-4">
      <Skeleton className="h-12 w-48 rounded-xl" />
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

// Page Loading Overlay
export const PageLoadingOverlay: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-white font-mono text-sm">{message}</p>
    </div>
  </div>
);
