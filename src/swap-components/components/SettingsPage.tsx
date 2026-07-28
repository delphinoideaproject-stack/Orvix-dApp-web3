import { useState } from 'react';
import { ArrowLeft, Save, RotateCcw, Check } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { DEFAULT_RPC, CHAIN_ID, NETWORK_NAME } from '../constants/contracts';
import type { Theme } from '../types';

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SystemIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

export default function SettingsPage({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings, resetRpc, theme, setTheme } = useSettings();
  const [rpcInput, setRpcInput] = useState(settings.rpcUrl);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({ rpcUrl: rpcInput });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetRpc();
    setRpcInput(DEFAULT_RPC);
  };

  return (
    <div className="relative z-10 px-5 md:px-0 md:max-w-[480px] mx-auto w-full pt-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <h1 className="text-2xl font-semibold mb-8">Settings</h1>

      {/* Network Info */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Network</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-border">
            <span className="text-sm text-text-secondary">Current Chain ID</span>
            <span className="text-sm font-medium font-mono">{CHAIN_ID}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-border">
            <span className="text-sm text-text-secondary">Current Network</span>
            <span className="text-sm font-medium">{NETWORK_NAME}</span>
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Theme</h2>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'dark' as Theme, label: 'Dark', icon: <MoonIcon /> },
            { value: 'light' as Theme, label: 'Light', icon: <SunIcon /> },
            { value: 'system' as Theme, label: 'System', icon: <SystemIcon /> },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                theme === opt.value
                  ? 'border-[#555555] dark:border-[#CCCCCC] bg-accent-cyan/5 text-accent-cyan'
                  : 'border-border bg-white/[0.02] text-text-secondary hover:bg-hover'
              }`}
            >
              {opt.icon}
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Slippage */}
      <section>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Swap Settings</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text-muted mb-2">Slippage Tolerance</label>
            <div className="flex gap-1.5">
              <button
                onClick={() => updateSettings({ slippageBps: 50, slippageAuto: true })}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  settings.slippageAuto
                    ? 'bg-accent-cyan text-bg-primary'
                    : 'bg-white/[0.03] text-text-secondary hover:bg-hover border border-border'
                }`}
              >
                Auto
              </button>
              {[10, 50, 100, 300].map((bps) => {
                const isSelected = !settings.slippageAuto && settings.slippageBps === bps;
                return (
                  <button
                    key={bps}
                    onClick={() => updateSettings({ slippageBps: bps, slippageAuto: false })}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-accent-cyan text-bg-primary'
                        : 'bg-white/[0.03] text-text-secondary hover:bg-hover border border-border'
                    }`}
                  >
                    {(bps / 100).toFixed(1)}%
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-2">Transaction Deadline (minutes)</label>
            <input
              type="number"
              value={settings.deadlineMinutes}
              onChange={(e) => updateSettings({ deadlineMinutes: parseInt(e.target.value) || 20 })}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border focus:border-[#555555] dark:focus:border-[#CCCCCC] focus:outline-none text-sm transition-colors"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
