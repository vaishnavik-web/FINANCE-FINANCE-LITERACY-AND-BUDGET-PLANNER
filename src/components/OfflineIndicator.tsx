import React from 'react';
import { RefreshCw, WifiOff, CloudCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, hasPendingSync, isSyncing, syncNow, mode, t } = useApp();

  if (isOnline && !hasPendingSync) {
    return null;
  }

  return (
    <div className="border-b border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-4 py-2 text-xs text-amber-900 dark:text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <WifiOff className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-300" />
          ) : (
            <CloudCheck className="w-4 h-4 shrink-0 text-teal-700 dark:text-teal-300" />
          )}
          <span>
            {!isOnline
              ? t('common.offlineBanner')
              : 'Connectivity restored. You have locally saved changes waiting to synchronize.'}
          </span>
        </div>

        {isOnline && hasPendingSync && mode === 'authenticated' && (
          <button
            type="button"
            onClick={() => syncNow()}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-1 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : t('common.syncNow')}
          </button>
        )}
      </div>
    </div>
  );
};
