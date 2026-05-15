import { create } from 'zustand';
import type { AnalyticsFilter } from '../types/analytics';

export type UploadStatus = 'idle' | 'dragging' | 'uploading' | 'processing' | 'completed' | 'failed';

interface UploadState {
  status: UploadStatus;
  progress: number;
  file: File | null;
  error: string | null;
  currentStep: number; // 0-3 for processing steps
}

interface AnalyticsStoreState {
  // Filter state
  filters: AnalyticsFilter;
  setFilters: (filters: Partial<AnalyticsFilter>) => void;
  resetFilters: () => void;

  // Upload state
  uploadState: UploadState;
  setUploadStatus: (status: UploadStatus) => void;
  setUploadProgress: (progress: number) => void;
  setUploadFile: (file: File | null) => void;
  setUploadError: (error: string | null) => void;
  setCurrentStep: (step: number) => void;
  resetUpload: () => void;
}

const defaultFilters: AnalyticsFilter = {
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  marketplaces: ['MEESHO', 'FLIPKART', 'AMAZON', 'OFFLINE'],
  categories: [],
  skuSearch: '',
  minMargin: 0,
};

const defaultUploadState: UploadState = {
  status: 'idle',
  progress: 0,
  file: null,
  error: null,
  currentStep: 0,
};

export const useAnalyticsStore = create<AnalyticsStoreState>((set) => ({
  filters: defaultFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),

  uploadState: defaultUploadState,
  setUploadStatus: (status) =>
    set((state) => ({
      uploadState: { ...state.uploadState, status },
    })),
  setUploadProgress: (progress) =>
    set((state) => ({
      uploadState: { ...state.uploadState, progress },
    })),
  setUploadFile: (file) =>
    set((state) => ({
      uploadState: { ...state.uploadState, file },
    })),
  setUploadError: (error) =>
    set((state) => ({
      uploadState: { ...state.uploadState, error },
    })),
  setCurrentStep: (currentStep) =>
    set((state) => ({
      uploadState: { ...state.uploadState, currentStep },
    })),
  resetUpload: () => set({ uploadState: defaultUploadState }),
}));
