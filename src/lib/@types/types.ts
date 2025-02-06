export interface QuantileMap {
	Q99: 99
	Q98: 98
	Q95: 95
	Q90: 90
	Q80: 80
	Q70: 70
}

export interface GasEstimate {
	gasPrice: bigint
	maxPriorityFeePerGas: bigint
	maxFeePerGas: bigint
}

export interface EstimationData {
	Q70: GasEstimate
	Q80: GasEstimate
	Q90: GasEstimate
	Q95: GasEstimate
	Q99: GasEstimate
	precision: number
	height: bigint
	timestamp: bigint
	chainid: bigint
}

export interface VPayload {
	typ: number
	value: string
}

export interface PayloadValues {
	height: bigint
	timestamp: bigint
	systemid: number
	chainid: bigint
	payloads: Array<VPayload>
}

export enum OracleNetworkKey {
	// ARBITRUM_SEPOLIA = 'arbitrumSepolia',
	// DEVNET = 'devnet'
	SEPOLIA = 'sepolia',
	OP_SEPOLIA = 'opSepolia',
	BASE_SEPOLIA = 'baseSepolia',
	LINEA_SEPOLIA = 'lineaSepolia',
	LINEA_MAINNET = 'linea'
}
export interface ReadChain {
	chainId: number
	label: string
	arch: 'evm' | 'btc' | 'unsupported'
}

export type OracleChain = {
	chainId: number
	label: string
	rpcUrl: string
	blockExplorerUrl: string
  contract: string
}
