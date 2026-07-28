import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from '../swap-components/contexts/WalletContext';
import { SettingsProvider } from '../swap-components/contexts/SettingsContext';
import { ToastProvider } from '../swap-components/contexts/ToastContext';
import SwapCard from '../swap-components/components/SwapCard';
import { Token } from '../types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, refetchOnWindowFocus: false },
  },
});

export function SwapPage({ 
  embedded = false, 
  onModalOpenChange, 
  preselectedToken,
  onClearPreselectedToken 
}: { 
  embedded?: boolean; 
  onModalOpenChange?: (isOpen: boolean) => void;
  preselectedToken?: Token | null;
  onClearPreselectedToken?: () => void;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <WalletProvider>
          <ToastProvider>
            <div className={`w-full ${embedded ? 'max-w-full py-4' : 'max-w-2xl py-8'} mx-auto`}>
              <SwapCard 
                preselectedToken={preselectedToken}
                onClearPreselectedToken={onClearPreselectedToken}
                embedded={embedded}
              />
            </div>
          </ToastProvider>
        </WalletProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
