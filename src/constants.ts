import { type OracleChain, OracleNetworkKey } from '$lib/@types/types'

export const gasNetwork = {
	url: 'https://test.devnet.gas.network',
	contract: '0x106A0e60fb930b96BDF9da93997747601435e1d9'
}

export const evmV2ContractTypValues = [107, 322]
export const mainnetV2ContractTypValues = [107, 322]

export const DEFAULT_ORACLE_NETWORK = OracleNetworkKey.SEPOLIA

export const oracleChains: Record<OracleNetworkKey, OracleChain> = {
	[OracleNetworkKey.SEPOLIA]: {
		chainId: 11155111,
		label: 'Ethereum Sepolia',
		rpcUrl: 'https://endpoints.omniatech.io/v1/eth/sepolia/public',
		blockExplorerUrl: 'https://sepolia.etherscan.io',
		contract: '0xCc936bE977BeDb5140C5584d8B6043C9068622A6'
	},
	[OracleNetworkKey.OP_SEPOLIA]: {
		chainId: 11155420,
		label: 'Optimism Sepolia',
		rpcUrl: 'https://sepolia.optimism.io',
		blockExplorerUrl: 'https://sepolia-optimism.etherscan.io',
		contract: '0x20A5DCE3646BD975edEE3082319bd0dB64A0e0B9'
	},
	[OracleNetworkKey.BASE_SEPOLIA]: {
		chainId: 84532,
		label: 'Base Sepolia',
		rpcUrl: 'https://sepolia.base.org',
		blockExplorerUrl: 'https://sepolia.basescan.org',
		contract: '0xD87f5Ea40C592DfFAe5B87922E1cdA2bb44CB67F'
	},
	[OracleNetworkKey.LINEA_SEPOLIA]: {
		chainId: 59141,
		label: 'Linea Sepolia',
		rpcUrl: 'https://linea-sepolia-rpc.publicnode.com',
		contract: '0xb690C4CbDE4747FD614477Ab24c7630C5aAa6Ec5',
		blockExplorerUrl: 'https://sepolia.lineascan.build'
	},
	[OracleNetworkKey.LINEA_MAINNET]: {
		chainId: 59144,
		label: 'Linea Mainnet',
		rpcUrl: 'https://rpc.linea.build',
		contract: '0x2c84370DaddBcD67d729689671A9Fe63DF39Cf13',
		blockExplorerUrl: 'https://lineascan.build'
	}
}

export const archSchemaMap: Record<string, number> = {
	btc: 1,
	evm: 2,
	unsupported: 0
}

export const evmTypeSchema: Record<number, { name: string; type: string; description: string }> = {
	'107': {
		name: 'base_fee_per_gas',
		type: 'number',
		description: 'Base Fee Per Gas'
	},
	'112': {
		name: 'blob_base_fee_per_gas',
		type: 'number',
		description: 'Blob Base Fee Per Gas'
	},
	'322': {
		name: 'pred_max_priority_fee_per_gas_p90',
		type: 'number',
		description: 'Max Priority Fee Per Gas Prediction - p90'
	}
}
