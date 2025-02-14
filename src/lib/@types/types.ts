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
	contractByType: Record<number, string>
}
