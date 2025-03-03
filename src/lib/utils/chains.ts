import {
	DEFAULT_ORACLE_CHAIN_ID,
	defaultOracleChain,
	evmV2ContractTypValues,
	mainnetV2ContractTypValues
} from '../../constants'
import type { OracleChain, ReadChain } from '$lib/@types/types'
import { utxoV2ContractTypValues } from '../../constants'

export const getOracleChainById = (
	chains: OracleChain[],
	chainId: number = DEFAULT_ORACLE_CHAIN_ID,
	arch: string = 'evm'
): OracleChain => {
	return (
		chains.find((chain) => chain.chainId === chainId && chain.arch === arch) ??
		chains.find(
			(chain) =>
				chain.chainId === defaultOracleChain.chainId && chain.arch === defaultOracleChain.arch
		)!
	)
}

export const getEstimateChainById = (
	chains: ReadChain[],
	chainId: number = 1,
	arch: string = 'evm'
): ReadChain => {
	return (
		chains.find((chain) => chain.chainId === chainId && chain.arch === arch) ??
		chains.find((chain) => chain.chainId === 1 && chain.arch === 'evm')!
	)
}

export const getTypValuesByArch = (arch: number, chainId: number = 1): number[] => {
	switch (arch) {
		case 1:
			return utxoV2ContractTypValues
		case 2:
			if (chainId === 1) {
				return mainnetV2ContractTypValues
			}
			return evmV2ContractTypValues
		default:
			return []
	}
}
