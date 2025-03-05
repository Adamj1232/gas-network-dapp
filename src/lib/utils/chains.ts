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

export const handleChainEstimationFees = (
	oracleEstimation: any,
	gasNet: any,
	estimateNetworkArch: string
) => {
	if (!oracleEstimation || !estimateNetworkArch) {
		throw new Error('There was an error parsing oracle estimations for the delta display')
	}
	if (estimateNetworkArch === 'evm') {
		const { base_fee_per_gas, pred_max_priority_fee_per_gas_p90 } = oracleEstimation
		const { payloads } = gasNet

		const gasNetBaseFeePerGas = hexToNumber(
			payloads.find((p: { typ: number }) => p.typ === 107)?.value
		)
		const gasNetPredMaxPriorityFeePerGasP90 = hexToNumber(
			payloads.find((p: { typ: number }) => p.typ === 322)?.value
		)

		const gasNetGasPrice = gasNetBaseFeePerGas + gasNetPredMaxPriorityFeePerGasP90

		const oracleGasPrice = Number(base_fee_per_gas) + Number(pred_max_priority_fee_per_gas_p90)

		return {
			gasNetGasPrice: toGwei(gasNetGasPrice),
			gasNetHeight: Number(gasNet.height),
			oracleGasPrice: toGwei(oracleGasPrice),
			oracleHeight: Number(oracleEstimation.height),
			difference:
				gasNetGasPrice && oracleGasPrice ? toGwei(gasNetGasPrice - oracleGasPrice) : undefined,
			percentage:
				gasNetGasPrice && oracleGasPrice
					? ((toGwei(gasNetGasPrice) - toGwei(oracleGasPrice)) / toGwei(oracleGasPrice)) * 100
					: undefined
		}
	}

	if (estimateNetworkArch === 'utxo') {
		console.log(oracleEstimation, gasNet)

		const oracleGasPrice = Number(oracleEstimation?.pred_gas_fee_p90)

		const payloads = gasNet?.payloads
		const gasNetPredFeeP90 = payloads
			? hexToNumber(payloads.find((p: { typ: number }) => p.typ === 342)?.value)
			: null

		return {
			gasNetGasPrice: gasNetPredFeeP90 ? toGwei(gasNetPredFeeP90) : null,
			gasNetHeight: gasNet?.height ? Number(gasNet.height) : null,
			oracleGasPrice: toGwei(oracleGasPrice),
			oracleHeight: Number(oracleEstimation.height),
			difference:
				gasNetPredFeeP90 && oracleGasPrice ? toGwei(gasNetPredFeeP90 - oracleGasPrice) : undefined,
			percentage:
				gasNetPredFeeP90 && oracleGasPrice
					? ((toGwei(gasNetPredFeeP90) - toGwei(oracleGasPrice)) / toGwei(oracleGasPrice)) * 100
					: undefined
		}
	}
}

const hexToNumber = (hex: string): number => {
	return Number(BigInt(hex))
}

const toGwei = (value: number | bigint): number => Number(value) / 1e9
