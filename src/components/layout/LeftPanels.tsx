import { useSimpleStore } from '@hexafield/simple-store/react'
import React from 'react'

import { AppTabState } from '../../state/AppTabsState'
import { CommunityCardsState } from '../../state/CommunityCardsState'
import { NetworkProvidersState } from '../../state/NetworkProvidersState'
import { UploadsState } from '../../state/UploadsState'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Input } from '../ui/Input'

export function LeftPanels() {
  const [tab] = useSimpleStore(AppTabState)
  return (
    <div className="pointer-events-auto">
      {tab === 'Community Data' && <CommunityDataPanel />}
      {tab === 'Visualize My Network' && <VisualizeNetworkPanel />}
      {tab === 'Upload File' && <UploadFilePanel />}
    </div>
  )
}

function PanelChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="w-[320px]">
      <CardHeader>
        <h3 className="text-[14px] font-medium">{title}</h3>
        <p className="text-[12px] text-neutral-500">
          We have done our due diligence to begin mapping all of the important networks we believe are valuable.
        </p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function CommunityDataPanel() {
  const [cards] = useSimpleStore(CommunityCardsState)
  return (
    <PanelChrome title="Custom Community Data">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c, idx) => (
          <div
            key={idx}
            className={[
              'rounded-xl border border-neutral-200 bg-white/80 p-3 hover:shadow-sm transition-shadow',
              idx === 0 ? 'ring-1 ring-green-400' : ''
            ].join(' ')}
          >
            <div className="text-[12px] font-medium">{c.title}</div>
            {c.subtitle ? <div className="text-[11px] text-neutral-500">{c.subtitle}</div> : null}
            {c.description ? <div className="text-[11px] text-neutral-500">{c.description}</div> : null}
          </div>
        ))}
      </div>
    </PanelChrome>
  )
}

function VisualizeNetworkPanel() {
  const [providers] = useSimpleStore(NetworkProvidersState)
  return (
    <PanelChrome title="">
      <div className="space-y-3">
        {providers.map((p, idx) => (
          <Card key={idx} className="bg-white/70">
            <CardContent>
              <div className="text-[13px] mb-1">{p.name}</div>
              <div className="text-[12px] text-neutral-500 mb-2">Map your {p.name.toLowerCase()} friends</div>
              <div className="flex items-center gap-2">
                <Input placeholder={p.placeholder} className="flex-1" />
                <Button variant="ghost" className="rounded-full h-10 w-10">
                  +
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PanelChrome>
  )
}

function UploadFilePanel() {
  const [uploads] = useSimpleStore(UploadsState)
  return (
    <PanelChrome title="Upload File(s)">
      <div className="mb-3">
        <div className="text-[12px] text-neutral-500">
          Please first run your files through our schema optimizer here
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-10 rounded-xl bg-white/70 border border-neutral-200 flex items-center px-3 text-neutral-400 text-[12px]">
          .csv or JSON
        </div>
        {uploads.map((u, idx) => (
          <div
            key={idx}
            className="h-12 rounded-xl bg-white/70 border border-neutral-200 flex items-center justify-between px-3"
          >
            <div className="text-[12px] flex items-center gap-2">
              <span className="w-4 h-4 rounded-sm border border-neutral-300" />
              <span>{u.name}</span>
              {u.note ? <span className="text-orange-500 ml-2">{u.note}</span> : null}
            </div>
            <div className="text-[12px] text-neutral-500">{u.sizeLabel}</div>
          </div>
        ))}
      </div>
    </PanelChrome>
  )
}
