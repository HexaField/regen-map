import React from 'react'

import { GitHubIcon } from '../ui/GitHubIcon'

// Pure content component for About modal (no state logic)
export function AboutModalContent() {
  return (
    <div className="text-[13px] leading-relaxed space-y-4 pr-1 overflow-y-auto max-h-full">
      <div>
        <p className="font-medium text-neutral-800 dark:text-neutral-100">Regen Map</p>
        <p className="text-neutral-600 dark:text-neutral-300 mt-1">
          An experimental explorer for regenerative ecosystem organizations and people. Data is aggregated from
          community-maintained sources and open schemas (Murmurations, Baserow, and more) and rendered as an interactive
          network graph.
        </p>
      </div>
      <div>
        <p className="font-medium text-neutral-800 dark:text-neutral-100">How it works</p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-600 dark:text-neutral-300">
          <li>Fetches multiple open data sources at runtime (no server required).</li>
          <li>Merges entities by shared identifiers (e.g. website, social handles, schema IDs).</li>
          <li>Derives relationships (membership, affiliation, collaboration) to create edges.</li>
          <li>Applies simple layout forces; filtering & focus controls adjust visibility & emphasis.</li>
        </ul>
      </div>
      <div>
        <p className="font-medium text-neutral-800 dark:text-neutral-100">Goals</p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-600 dark:text-neutral-300">
          <li>Surface under-connected clusters and potential collaborations.</li>
          <li>Offer an open, remixable map. Data stays decentralized.</li>
          <li>Prototype a lightweight pattern for community knowledge graphs.</li>
        </ul>
      </div>
      <div>
        <p className="font-medium text-neutral-800 dark:text-neutral-100">Contribute</p>
        <p className="text-neutral-600 dark:text-neutral-300 mt-1">
          Contributions & feedback welcome. Improve data sources, schemas, edge inference, UI/UX, performance, or
          documentation.
        </p>
        <a
          href="https://github.com/HexaField/regen-map"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-2 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white"
        >
          <GitHubIcon size={16} />
          <span className="text-[12px] font-medium">GitHub Repository</span>
        </a>
      </div>
      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400">
        Data may be incomplete or out-of-date. Please verify before reuse.
      </div>
    </div>
  )
}
