import {
	type OracleChain,
	type ReadChain,
	OracleNetworkKey,
	TargetNetworkKey,
	type QuantileMap
} from '$lib/@types/types'

export const gasNetwork = {
	// url: 'https://http-rpc.devnet.gas.network',
	url: 'https://test.devnet.gas.network',
	contract: '0x106A0e60fb930b96BDF9da93997747601435e1d9'
}

export const evmV2ContractTypValues = [107, 322]
export const mainnetV2ContractTypValues = [107, 112, 322]

// You can then create the object that implements this interface:
export const quantiles: QuantileMap = {
	Q99: 99,
	Q98: 98,
	Q95: 95,
	Q90: 90,
	Q80: 80,
	Q70: 70
}

export const oracleChains: Record<OracleNetworkKey, OracleChain> = {
	// [OracleNetworkKey.ARBITRUM_SEPOLIA]: {
	//   chainId: 421614,
	//   display: 'Arb Sepolia',
	//   rpcUrl: 'https://arbitrum-sepolia.gateway.tenderly.co',
	//   contract: '',
	// blockExplorerUrl: 'https://sepolia.arbiscan.io'
	// },
	// [OracleNetworkKey.DEVNET]: {
	// 	chainId: 19735516467,
	// 	display: 'Gas Devnet',
	// 	rpcUrl: 'https://http-rpc.devnet.gas.network',
	// 	contract: '0xeb4AE8e5828d0675F4D8420A188F53E1Fdf65e5E',
	// 	blockExplorerUrl: 'https://explorer.devnet.gas.network'
	// },
	[OracleNetworkKey.SEPOLIA]: {
		chainId: 11155111,
		display: 'Ethereum Sepolia',
		rpcUrl: 'https://endpoints.omniatech.io/v1/eth/sepolia/public',
		blockExplorerUrl: 'https://sepolia.etherscan.io',
		contract: '0xCc936bE977BeDb5140C5584d8B6043C9068622A6'
	},
	[OracleNetworkKey.OP_SEPOLIA]: {
		chainId: 11155420,
		display: 'Optimism Sepolia',
		rpcUrl: 'https://sepolia.optimism.io',
		blockExplorerUrl: 'https://sepolia-optimism.etherscan.io',
		contract: '0x20A5DCE3646BD975edEE3082319bd0dB64A0e0B9'
	},
	[OracleNetworkKey.BASE_SEPOLIA]: {
		chainId: 84532,
		display: 'Base Sepolia',
		rpcUrl: 'https://sepolia.base.org',
		blockExplorerUrl: 'https://sepolia.basescan.org',
		contract: '0xD87f5Ea40C592DfFAe5B87922E1cdA2bb44CB67F'
	},
	[OracleNetworkKey.LINEA_SEPOLIA]: {
		chainId: 59141,
		display: 'Linea Sepolia',
		rpcUrl: 'https://linea-sepolia-rpc.publicnode.com',
		contract: '0xb690C4CbDE4747FD614477Ab24c7630C5aAa6Ec5',
		blockExplorerUrl: 'https://sepolia.lineascan.build'
	},
	[OracleNetworkKey.LINEA_MAINNET]: {
		chainId: 59144,
		display: 'Linea Mainnet',
		rpcUrl: 'https://rpc.linea.build',
		contract: '0x2c84370DaddBcD67d729689671A9Fe63DF39Cf13',
		blockExplorerUrl: 'https://lineascan.build'
	}
}

export const targetReadChains: Record<TargetNetworkKey, ReadChain> = {
	// Supported chains are sorted in the component handler
	[TargetNetworkKey.ARBITRUM]: {
		chainId: 42161,
		display: 'Arbitrum',
		arch: 'evm'
	},
	[TargetNetworkKey.AVALANCHE]: {
		chainId: 43114,
		display: 'Avalanche',
		arch: 'evm'
	},
	[TargetNetworkKey.BASE]: {
		chainId: 8453,
		display: 'Base',
		arch: 'evm'
	},
	[TargetNetworkKey.BLAST]: {
		chainId: 81457,
		display: 'Blast',
		arch: 'evm'
	},
	[TargetNetworkKey.CHILIZ]: {
		chainId: 88888,
		display: 'Chiliz',
		arch: 'evm'
	},
	[TargetNetworkKey.CRONOS]: {
		chainId: 25,
		display: 'Cronos',
		arch: 'evm'
	},
	[TargetNetworkKey.MAIN]: {
		chainId: 1,
		display: 'Ethereum',
		arch: 'evm'
	},
	[TargetNetworkKey.FANTOM]: {
		chainId: 250,
		display: 'Fantom',
		arch: 'evm'
	},
	[TargetNetworkKey.LINEA]: {
		chainId: 59144,
		display: 'Linea',
		arch: 'evm'
	},
	[TargetNetworkKey.LISK]: {
		chainId: 1135,
		display: 'Lisk',
		arch: 'evm'
	},
	[TargetNetworkKey.MANTLE]: {
		chainId: 5000,
		display: 'Mantle',
		arch: 'evm'
	},
	[TargetNetworkKey.MOONBEAM]: {
		chainId: 1284,
		display: 'Moonbeam',
		arch: 'evm'
	},
	[TargetNetworkKey.OPTIMISM]: {
		chainId: 10,
		display: 'Optimism',
		arch: 'evm'
	},
	[TargetNetworkKey.POLYGON]: {
		chainId: 137,
		display: 'Polygon',
		arch: 'evm'
	},
	[TargetNetworkKey.RONIN]: {
		chainId: 2020,
		display: 'Ronin',
		arch: 'evm'
	},
	[TargetNetworkKey.SEI]: {
		chainId: 1329,
		display: 'SEI',
		arch: 'evm'
	},
	[TargetNetworkKey.ZKSYNC]: {
		chainId: 324,
		display: 'zkSync',
		arch: 'evm'
	},
	[TargetNetworkKey.GNOSIS]: {
		chainId: 100,
		display: 'Gnosis',
		arch: 'evm'
	},
	[TargetNetworkKey.IMMUTABLE]: {
		chainId: 204,
		display: 'Immutable zkEVM',
		arch: 'evm'
	},
	[TargetNetworkKey.OPBNB]: {
		chainId: 13371,
		display: 'opBNB',
		arch: 'evm'
	},
	[TargetNetworkKey.SCROLL]: {
		chainId: 534352,
		display: 'Scroll',
		arch: 'evm'
	},
	[TargetNetworkKey.ZETACHAIN]: {
		chainId: 7000,
		display: 'ZetaChain',
		arch: 'evm'
	},
	[TargetNetworkKey.POLYGONZKEVM]: {
		chainId: 1101,
		display: 'Polygon zkEVM',
		arch: 'evm'
	},
	[TargetNetworkKey.WORLDCHAIN]: {
		chainId: 480,
		display: 'World Chain',
		arch: 'evm'
	},
	[TargetNetworkKey.ROOTSTOCK]: {
		chainId: 30,
		display: 'Rootstock',
		arch: 'evm'
	},
	[TargetNetworkKey.FRAXTAL]: {
		chainId: 252,
		display: 'Fraxtal',
		arch: 'evm'
	},
	[TargetNetworkKey.ZORA]: {
		chainId: 7777777,
		display: 'Zora',
		arch: 'evm'
	},
	[TargetNetworkKey.INK]: {
		chainId: 57073,
		display: 'Ink',
		arch: 'evm'
	},
	[TargetNetworkKey.LENSSEPOLIA]: {
		chainId: 37111,
		display: 'Lens Sepolia',
		arch: 'evm'
	},
	[TargetNetworkKey.PALM]: {
		chainId: 11297108109,
		display: 'Palm',
		arch: 'evm'
	},
	[TargetNetworkKey.STORYODYSSEY]: {
		chainId: 1516,
		display: 'Story Odyssey',
		arch: 'evm'
	},
	[TargetNetworkKey.BOB]: {
		chainId: 60808,
		display: 'Bob',
		arch: 'evm'
	},
	[TargetNetworkKey.SNAX]: {
		chainId: 2192,
		display: 'SNAXchain',
		arch: 'evm'
	},
	[TargetNetworkKey.TAIKO]: {
		chainId: 167000,
		display: 'Taiko',
		arch: 'evm'
	},
	[TargetNetworkKey.METIS]: {
		chainId: 1088,
		display: 'Metis',
		arch: 'evm'
	},
	[TargetNetworkKey.MODE]: {
		chainId: 34443,
		display: 'Mode',
		arch: 'evm'
	},

	// Add new chains above this
	// Unsupported chain for error testing
	[TargetNetworkKey.UNSUPPORTED_CHAIN]: {
		chainId: 1638,
		display: 'Unsupported Chain',
		arch: 'unsupported'
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
