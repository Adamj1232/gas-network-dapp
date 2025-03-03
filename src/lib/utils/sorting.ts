import type { OracleChain, ReadChain } from '$lib/@types/types'
import { SUPPORTED_ORACLE_VERSIONS } from '../../constants'

export function orderAndFilterOraclesAlphabetically(
	oracleNetworksList: OracleChain[]
): OracleChain[] {
	return oracleNetworksList
		.filter((chain) => !chain.testnet && chain.addressByVersion[SUPPORTED_ORACLE_VERSIONS])
		.sort((a, b) => a.label.localeCompare(b.label))
}

export function orderAndFilterReadChainsAlphabetically(
	networksList: ReadChain[] | undefined
): ReadChain[] {
	if (!networksList) return []
	return [...networksList].sort((a, b) => a.label.localeCompare(b.label))
}
