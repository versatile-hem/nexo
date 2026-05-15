/**
 * DragDropZone Component
 * Handles file upload with 5-state machine: idle → dragging → uploading → processing → completed/failed
 * 
 * Features:
 * - Drag-and-drop support
 * - File type validation (XLSX, CSV only)
 * - Progress tracking
 * - Step-based processing visualization
 * - Error handling
 */

import { Cloud, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { useAnalyticsStore } from '../store/analyticsStore';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticsReport } from '../types/reports';

interface DragDropZoneProps {
  onUploadComplete?: (report: AnalyticsReport) => void;
}

const PROCESSING_STEPS = [
  'Parsing File',
  'Validating Data',
  'Analyzing Records',
  'Generating Insights',
];

export function DragDropZone({ onUploadComplete }: DragDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  
  const uploadState = useAnalyticsStore((state) => state.uploadState);
  const setUploadStatus = useAnalyticsStore((state) => state.setUploadStatus);
  const setUploadProgress = useAnalyticsStore((state) => state.setUploadProgress);
  const setUploadFile = useAnalyticsStore((state) => state.setUploadFile);
  const setUploadError = useAnalyticsStore((state) => state.setUploadError);
  const setCurrentStep = useAnalyticsStore((state) => state.setCurrentStep);
  const resetUpload = useAnalyticsStore((state) => state.resetUpload);

  const isValidFile = (file: File): boolean => {
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    return validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.csv');
  };

  const handleFileSelect = async (file: File) => {
    if (!isValidFile(file)) {
      setUploadError('Only XLSX and CSV files are supported');
      setUploadStatus('failed');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File must be smaller than 50MB');
      setUploadStatus('failed');
      return;
    }

    setUploadFile(file);
    setUploadStatus('uploading');
    setUploadError(null);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      // Start processing
      setUploadStatus('processing');
      setCurrentStep(0);

      // Simulate processing steps
      for (let step = 0; step < PROCESSING_STEPS.length; step++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setCurrentStep(step + 1);
      }

      // Upload file to backend
      const uploadedReport = await analyticsService.uploadReport(file);
      setReport(uploadedReport);
      setUploadStatus('completed');
      onUploadComplete?.(uploadedReport);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setUploadStatus('failed');
      console.error('Upload error:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploadState.status === 'idle' || uploadState.status === 'failed') {
      setUploadStatus('dragging');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploadState.status === 'dragging') {
      setUploadStatus('idle');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadStatus('idle');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleReset = () => {
    resetUpload();
    setReport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Idle state
  if (uploadState.status === 'idle') {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center transition-all duration-200',
          'hover:border-nexo-accent hover:bg-nexo-accent/5',
          'dark:border-slate-600 dark:hover:bg-nexo-accent/10'
        )}
      >
        <Cloud className="mx-auto mb-4 h-12 w-12 text-slate-400 dark:text-slate-500" />
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
          Drag files here or click to browse
        </h3>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Supported formats: <strong>XLSX, CSV</strong> (Max 50MB)
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg bg-nexo-accent px-6 py-2 text-white transition hover:opacity-90"
        >
          Browse Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  // Dragging state
  if (uploadState.status === 'dragging') {
    return (
      <div className="rounded-2xl border-2 border-solid border-nexo-accent bg-nexo-accent/10 p-12 text-center shadow-lg dark:bg-nexo-accent/20">
        <Cloud className="mx-auto mb-4 h-12 w-12 animate-bounce text-nexo-accent" />
        <p className="text-lg font-semibold text-nexo-accent">Drop your file here</p>
      </div>
    );
  }

  // Uploading state
  if (uploadState.status === 'uploading') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex justify-center">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 28 * (uploadState.progress / 100)} ${2 * Math.PI * 28}`}
                className="text-nexo-accent transition-all"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '32px 32px' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-nexo-accent">
              {uploadState.progress}%
            </div>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Uploading <strong>{uploadState.file?.name}</strong>...
        </p>
      </div>
    );
  }

  // Processing state
  if (uploadState.status === 'processing') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 dark:border-slate-700 dark:bg-slate-900">
        <div className="space-y-4">
          {PROCESSING_STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  index < uploadState.currentStep
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : index === uploadState.currentStep
                      ? 'bg-nexo-accent/20 text-nexo-accent'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                )}
              >
                {index < uploadState.currentStep ? '✓' : <Loader className="h-4 w-4 animate-spin" />}
              </div>
              <span
                className={cn(
                  'text-sm',
                  index <= uploadState.currentStep
                    ? 'font-semibold text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                )}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Completed state
  if (uploadState.status === 'completed' && report) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-12 text-center dark:border-green-900/30 dark:bg-green-900/10">
        <div className="mb-4 flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-green-900 dark:text-green-300">
          Upload Successful!
        </h3>
        <p className="mb-6 text-sm text-green-700 dark:text-green-400">
          Parsed <strong>{report.summary.totalRecords}</strong> records from{' '}
          <strong>{report.fileName}</strong>
        </p>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-lg bg-nexo-accent px-6 py-2 text-white transition hover:opacity-90"
        >
          Upload Another File
        </button>
      </div>
    );
  }

  // Failed state
  if (uploadState.status === 'failed') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900/30 dark:bg-red-900/10">
        <div className="mb-4 flex justify-center">
          <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-300">
          Upload Failed
        </h3>
        <p className="mb-6 text-sm text-red-700 dark:text-red-400">
          {uploadState.error || 'An error occurred during upload'}
        </p>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-lg bg-nexo-accent px-6 py-2 text-white transition hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
}
