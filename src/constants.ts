import { type OracleChain } from '$lib/@types/types'

export const BN_CHAINS_ENDPOINT = 'https://api.blocknative.com/chains'
export const BN_ORACLE_CHAINS_ENDPOINT = 'https://api.blocknative.com/oracles'

export const gasNetwork = {
	url: 'https://test.devnet.gas.network',
	contract: '0x106A0e60fb930b96BDF9da93997747601435e1d9'
}

export const evmV2ContractTypValues = [107, 322]
export const mainnetV2ContractTypValues = [107, 322]
export const utxoV2ContractTypValues = [342]

export const SUPPORTED_ORACLE_VERSIONS = 2

export const defaultOracleChain: OracleChain = {
  chainId: 59144,
	label: 'Linea',
	rpcUrl: 'https://rpc.linea.build',
	addressByVersion: { 2: '0x2c84370DaddBcD67d729689671A9Fe63DF39Cf13' },
	blockExplorerUrl: 'https://lineascan.build',
	testnet: false
}
export const DEFAULT_ORACLE_CHAIN_ID = defaultOracleChain.chainId


export const archSchemaMap: Record<string, number> = {
	utxo: 1,
	evm: 2,
	unsupported: 0
}

export const evmTypeSchema: Record<number, { name: string; type: string; description: string }> = {
	'107': {
		name: 'base_fee_per_gas',
		type: 'number',
		description: 'Base Fee'
	},
	'112': {
		name: 'blob_base_fee_per_gas',
		type: 'number',
		description: 'Blob Base Fee'
	},
	'322': {
		name: 'pred_max_priority_fee_per_gas_p90',
		type: 'number',
		description: 'P90 Max Priority Fee'
	},
	'342': {
		name: 'pred_gas_fee_p90',
		type: 'number',
		description: 'P90 Gas Fee'
	}
}
