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
	addressByVersion: Record<number, string>
	testnet?: boolean
	icon?: string
  arch?: string
}
