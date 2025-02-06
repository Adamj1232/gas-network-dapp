import type { ReadChain } from '$lib/@types/types'

export function orderAndFilterChainsAlphabetically<T extends { label: string }>(
    networksList: Record<string, T>
): [string, T][] {
    return Object.entries(networksList).sort((a, b) => 
        a[1].label.localeCompare(b[1].label)
    )
}

export function orderAndFilterReadChainsAlphabetically(
    networksList: ReadChain[] | undefined
): ReadChain[] {
    if (!networksList) return []
    return [...networksList].sort((a, b) => 
        a.label.localeCompare(b.label)
    )
} 