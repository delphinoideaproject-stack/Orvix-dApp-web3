import React from 'react';
import { StaticPage } from './StaticPage';

export function DocsPage() {
  return (
    <StaticPage title="Documentation">
      <div className="space-y-6">
        <p className="text-lg leading-relaxed">
          Welcome to the <strong>Orvix Protocol</strong> documentation. Orvix is a deterministic discovery protocol for verified Web3 assets operating exclusively on the BNB Chain (BSC). Our platform offers a seamless ecosystem for token curation, trading (AMM V2), and tracking.
        </p>

        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">1. Introduction</h2>
        <p>
          Orvix aims to solve the discovery and liquidity issues prevalent in decentralized finance by introducing a rigorous verification and bonding curve mechanism. This ensures that only projects with genuine utility and verified smart contracts reach the trading terminal.
        </p>

        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">2. Platform Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Discovery & Launchpad:</strong> Algorithmic identification and manual review of early-stage blockchain projects.</li>
          <li><strong>Bonding Curve Mechanism:</strong> Tokens must reach a specific liquidity threshold (100% on the progress bar) to graduate and be listed on the main Orvix DEX and PancakeSwap.</li>
          <li><strong>Orvix Swap (AMM):</strong> A decentralized exchange with automated routing, minimal slippage, and direct on-chain execution.</li>
          <li><strong>Secure Contract Curation:</strong> Automatic checking for renounced ownership, liquidity locks, and honeypot risks.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">3. Getting Started</h2>
        <p>
          To interact with the platform, connect your Web3 wallet (MetaMask, Trust Wallet, etc.) supporting the BNB Chain. Ensure you are connected to either the BSC Mainnet (ChainID 56) or BSC Testnet (ChainID 97) as required.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl mt-6">
          <h3 className="font-bold mb-2 text-zinc-800 dark:text-zinc-200">Developer API</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Our REST and GraphQL APIs are currently in closed beta. For integration inquiries, please reach out via our contact channels.
          </p>
        </div>
      </div>
    </StaticPage>
  );
}

export function WhitepaperPage() {
  return (
    <StaticPage title="Whitepaper">
      <div className="space-y-6">
        <p className="text-lg leading-relaxed">
          <strong>Orvix Labs:</strong> A deterministic approach to token curation, liquidity assurance, and decentralized trading on the BNB Chain.
        </p>

        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">Abstract</h2>
        <p>
          The decentralized finance (DeFi) space is fraught with information asymmetry. Retail investors struggle to distinguish between legitimate early-stage projects and malicious contracts (rug pulls, honeypots). Orvix introduces a unified curation and trading protocol designed to mitigate these risks through automated contract analysis and a mathematically proven bonding curve model.
        </p>

        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">1. The Problem</h2>
        <p>
          The current landscape of token discovery is filled with noise. Anyone can deploy a smart contract, leading to thousands of unverified, illiquid, and often malicious tokens. Without a standardized vetting process, the burden of due diligence falls entirely on the individual, stifling mainstream DeFi adoption.
        </p>

        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">2. The Orvix Solution</h2>
        <p>
          Orvix implements a multi-layered curation process:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Contract Verification:</strong> Automated static analysis of bytecode to detect common vulnerabilities and malicious functions (e.g., hidden mints, excessive taxes).</li>
          <li><strong>Liquidity Locking (The Bonding Curve):</strong> New tokens are launched on a specialized bonding curve. Funds are pooled directly into a secure smart contract. Only upon reaching the funding threshold is the liquidity paired and permanently locked in an AMM pool.</li>
          <li><strong>Community Curation:</strong> Decentralized voting and transparent tracking of creator addresses to build a reputation system.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">3. Tokenomics & Revenue Model</h2>
        <p>
          The ORX utility token powers the ecosystem, granting holders governance rights, reduced trading fees, and priority access to high-tier token launches. A nominal fee on DEX trades is algorithmically distributed between liquidity providers, token buybacks, and the Orvix treasury.
        </p>
        
        <p className="mt-8 text-sm italic text-zinc-500">
          Version 1.0. Last updated: July 2026. This document is for informational purposes only and does not constitute financial advice.
        </p>
      </div>
    </StaticPage>
  );
}

export function ContactPage() {
  return (
    <StaticPage title="Contact Us">
      <div className="space-y-6">
        <p className="text-lg leading-relaxed">
          Have questions, partnership inquiries, or need support? Reach out to the Orvix curation and development team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050b14]">
            <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-100">General Support</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">For general inquiries and platform assistance.</p>
            <a href="mailto:support@orvix.labs" className="text-cyan-600 dark:text-cyan-400 font-mono text-sm hover:underline">support@orvix.labs</a>
          </div>
          
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050b14]">
            <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-100">Security & Audits</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">To report vulnerabilities or request contract audits.</p>
            <a href="mailto:security@orvix.labs" className="text-cyan-600 dark:text-cyan-400 font-mono text-sm hover:underline">security@orvix.labs</a>
          </div>
          
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050b14]">
            <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-100">Community (Telegram)</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">Join the conversation and get real-time updates.</p>
            <a href="https://t.me/orvix_support" target="_blank" rel="noreferrer" className="text-cyan-600 dark:text-cyan-400 font-mono text-sm hover:underline">@orvix_support</a>
          </div>
          
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050b14]">
            <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-100">Business & Partnerships</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">For institutional investors and project collaborations.</p>
            <a href="mailto:partners@orvix.labs" className="text-cyan-600 dark:text-cyan-400 font-mono text-sm hover:underline">partners@orvix.labs</a>
          </div>
        </div>
      </div>
    </StaticPage>
  );
}

export function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy & Terms of Use">
      <div className="space-y-6">
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 mb-8">
          Last Updated: July 28, 2026
        </p>

        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">1. Data Collection & Privacy</h2>
        <p>
          We respect your privacy. Orvix operates as a decentralized interface. We do not require account registration, and we do not track personal wallet activity beyond what is publicly available on the blockchain. We only store information explicitly provided during the token submission process, such as project descriptions and social links.
        </p>

        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">2. Blockchain Analytics</h2>
        <p>
          By connecting your wallet, you acknowledge that your public wallet address and transaction history are permanently recorded on the BNB Chain. Orvix may aggregate public on-chain data to provide analytics, leaderboards, and curation metrics.
        </p>

        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">3. Assumption of Risk</h2>
        <p>
          Trading cryptocurrencies and interacting with smart contracts involves significant risk. The Orvix platform provides technical analysis tools and liquidity locking mechanisms, but this does not constitute financial advice or a guarantee against losses. Users are solely responsible for their investment decisions and should conduct their own research (DYOR) before trading any asset.
        </p>

        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">4. Terms of Use</h2>
        <p>
          By accessing the Orvix platform, you agree to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Not engage in malicious activities, including deploying honeypots, exploiting platform vulnerabilities, or conducting front-running attacks.</li>
          <li>Comply with all applicable laws and regulations in your jurisdiction regarding cryptocurrency trading.</li>
          <li>Accept that the platform is provided "as is", without any warranties regarding continuous uptime or error-free operation.</li>
        </ul>
        
        <h2 className="text-2xl font-bold mt-8 text-zinc-900 dark:text-zinc-100">5. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with standard decentralized protocol operations. Any disputes related to the platform interface shall be handled through community governance and decentralized dispute resolution mechanisms where applicable.
        </p>
      </div>
    </StaticPage>
  );
}
