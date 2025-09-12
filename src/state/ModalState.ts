import { createSimpleStore } from '@hexafield/simple-store/react'
import React from 'react'

export interface ModalDescriptor<P = any> {
  id: string
  component: React.ComponentType<P>
  props?: P
}

export const ModalRegistryState: ReturnType<typeof createSimpleStore<ModalDescriptor[]>> = createSimpleStore<
  ModalDescriptor[]
>([])

export function openModal<P>(id: string, component: React.ComponentType<P>, props?: P) {
  ModalRegistryState.set((list) => {
    // replace if exists (bring to front)
    const filtered = list.filter((m) => m.id !== id)
    return [...filtered, { id, component: component as React.ComponentType<any>, props }]
  })
}

export function closeModal(id: string) {
  ModalRegistryState.set((list) => list.filter((m) => m.id !== id))
}

export function toggleModal<P>(id: string, component: React.ComponentType<P>, props?: P) {
  ModalRegistryState.set((list) => {
    const exists = list.some((m) => m.id === id)
    if (exists) return list.filter((m) => m.id !== id)
    return [...list, { id, component: component as React.ComponentType<any>, props }]
  })
}

export function isModalOpen(id: string) {
  return ModalRegistryState.get().some((m) => m.id === id)
}
