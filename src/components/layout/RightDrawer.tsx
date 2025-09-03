import { useSimpleStore } from '@hexafield/simple-store/react'
import React from 'react'

import avatarImg from '../../assets/placeholder-avatar.png'
import rectangleImg from '../../assets/placeholder-background.png'
import { NodePanelOpenState, SelectedProfileState } from '../../state/app'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Chip } from '../ui/Chip'

export function RightDrawer() {
  const [open, setOpen] = useSimpleStore(NodePanelOpenState)
  const [profile] = useSimpleStore(SelectedProfileState)
  return (
    <div
      className={[
        'pointer-events-auto transition-all',
        open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      ].join(' ')}
    >
      <div className="w-[360px] space-y-3">
        {/* Header card */}
        <Card>
          <div className=" h-28 rounded-t-xl bg-cover bg-center" style={{ backgroundImage: `url(${rectangleImg})` }} />
          <CardContent>
            <div className="-mt-10 mb-2">
              <div className="w-16 h-16 rounded-full ring-4 ring-white overflow-hidden">
                <img src={avatarImg} alt="avatar" />
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
        <Card>
          <CardHeader>
            <div className="text-[12px] text-neutral-500">Location</div>
          </CardHeader>
          <CardContent>
            <div className="text-[13px]">{profile?.location}</div>
          </CardContent>
        </Card>

        {/* Links */}
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

        {/* Common friends (placeholder avatars) */}
        <Card>
          <CardHeader>
            <div className="text-[12px] text-neutral-500">Common Friends</div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="w-14">
                  <img className="rounded-md" src={avatarImg} alt="friend" />
                  <div className="text-[10px] mt-1 text-center">Dylan Tull</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <div className="text-[12px] text-neutral-500">Bio</div>
          </CardHeader>
          <CardContent>
            <div className="text-[13px]">{profile?.bio}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile?.tags.map((t, i) => (
                <Chip key={i}>{t}</Chip>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
