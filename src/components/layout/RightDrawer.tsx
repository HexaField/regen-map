import { useSimpleStore } from '@hexafield/simple-store/react'
import React, { useEffect } from 'react'

import placeholder from '../../assets/placeholder-avatar.webp'
import rectangleImg from '../../assets/placeholder-background.png'
import { GraphState, setFocusedNode } from '../../state/GraphState'
import { NodePanelOpenState } from '../../state/NodePanelState'
import { SelectedProfileState } from '../../state/ProfileState'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Chip } from '../ui/Chip'

export function RightDrawer() {
  const [open, setOpen] = useSimpleStore(NodePanelOpenState)
  const [profile] = useSimpleStore(SelectedProfileState)

  useEffect(() => {
    setOpen(!!profile?.id)
  }, [!!profile])

  return (
    <div
      className={[
        'pointer-events-auto transition-all',
        open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      ].join(' ')}
    >
      <div className="w-full min-w-[320px] space-y-3">
        {/* Header card */}
        <Card>
          <div className=" h-28 rounded-t-xl bg-cover bg-center" style={{ backgroundImage: `url(${rectangleImg})` }} />
          <CardContent>
            <div className="-mt-10 mb-2">
              <div className="w-16 h-16 rounded-full ring-4 ring-white overflow-hidden">
                <img src={profile?.image} alt="avatar" />
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[16px] font-semibold">{profile?.name}</div>
                <div className="text-[12px] text-neutral-500 max-w-[260px]">{profile?.title}</div>
              </div>
              <Button variant="ghost" className="rounded-full text-[12px] h-8 px-3" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        {profile?.location ? (
          <Card>
            <CardHeader>
              <div className="text-[12px] text-neutral-500">Location</div>
            </CardHeader>
            <CardContent>
              <div className="text-[13px]">{profile?.location}</div>
            </CardContent>
          </Card>
        ) : (
          <></>
        )}

        {/* Links */}
        {profile?.links.length ? (
          <Card>
            <CardHeader>
              <div className="text-[12px] text-neutral-500">Links</div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile?.links.map((l, i) => (
                  <Chip key={i}>{l.label}</Chip>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <></>
        )}

        {profile?.relationships.length ? (
          <Card>
            <CardHeader>
              <div className="text-[12px] text-neutral-500">Relationships</div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto">
                {profile?.relationships.map((r) => (
                  <button
                    key={r.name}
                    className="w-14 cursor-pointer"
                    onClick={() => {
                      setFocusedNode(GraphState.get().nodes.find((n) => n.name === r.name)!)
                    }}
                  >
                    <img className="rounded-md w-14 h-14 object-contain" src={r.image || placeholder} alt="friend" />
                    <div className="text-[10px] mt-1 text-center">{r.name}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
