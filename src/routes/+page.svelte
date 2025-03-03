<script lang="ts">
	import { onMount } from 'svelte'
	import { map, share } from 'rxjs/operators'
	import { timer, type Observable, of, Subject } from 'rxjs'
	import type { OnboardAPI, WalletState } from '@web3-onboard/core'
	import { getOnboard } from '$lib/services/web3-onboard'
	import { gasNetwork, archSchemaMap, evmTypeSchema, SUPPORTED_ORACLE_VERSIONS } from '../constants'
	import consumerV2 from '$lib/abis/consumerV2.json'
	import gasnetV2 from '$lib/abis/gasnetV2.json'
	import type { OracleChain, ReadChain } from '$lib/@types/types'
	import type { Contract } from 'ethers'
	import { fetchChains, fetchOracleChains } from '$lib/services/api'
	import { parsePayload } from '$lib/utils/payload'
	import {
		orderAndFilterOraclesAlphabetically,
		orderAndFilterReadChainsAlphabetically
	} from '$lib/utils/sorting'
	import StepIndicator from '$lib/components/StepIndicator.svelte'
	import { writable } from 'svelte/store'
	import { switchMap } from 'rxjs/operators'
	import { onDestroy } from 'svelte'
	import { getEstimateChainById, getOracleChainById, getTypValuesByArch } from '$lib/utils/chains'
	import gasNetIcon from '$lib/svg/gas-network-icon.svg?raw'

	const currentStep = writable(0)

	let v2PublishedGasData: Record<string, number | bigint> | null = null

	let v2ContractRawRes: string | null = null
	let transactionHash: string | null = null
	let publishErrorMessage: string | null = null
	let readFromGasNetErrorMessage: string | null = null
	let v2NoDataFoundErrorMsg: string | null = null
	let readFromTargetNetErrorMessage: string | null = null
	let isLoading = false
	let wallets$: Observable<WalletState[]>
	let readGasDataFromTargetChainTime: string

	let selectedEstimateNetwork: ReadChain
	let selectedOracleNetwork: OracleChain

	let estimateDeltaData$: Subject<any> = new Subject()
	let intervalId: ReturnType<typeof setInterval>
	let estimateChains: ReadChain[] | undefined
	let oracleChains: OracleChain[] | undefined
	let onboard: OnboardAPI

	// Stores for the latest values
	const gasNetEstimate = writable<any>(null)
	const oracleReading = writable<any>(null)

	$: if (onboard && $wallets$?.length === 0) {
		onboard.connectWallet()
	}

	$: if ($wallets$?.[0]?.provider && selectedEstimateNetwork && selectedOracleNetwork) {
		getDeltaData()
	}

	// Calculate time elapsed
	const timeElapsed2$ = estimateDeltaData$.pipe(
		switchMap((result) => {
			if (!result?.oracle?.timestamp) return of('')
			const timestamp = Number(result.oracle.timestamp)
			return timer(0, 1000).pipe(
				map(() => {
					return getTimeElapsed(timestamp)
				}),
				share()
			)
		})
	)

	// Calculate gas delta
	const gasDelta$ = estimateDeltaData$.pipe(
		map((result) => {
			if (!result?.gasNet || !result?.oracle) return null
			const { gasNet, oracle } = result
			if (!gasNet || !oracle) return null

			// TODO: Handle for BTC
			const { base_fee_per_gas, pred_max_priority_fee_per_gas_p90 } = oracle
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
				oracleGasPrice: toGwei(oracleGasPrice),
				difference:
					gasNetGasPrice && oracleGasPrice ? toGwei(gasNetGasPrice - oracleGasPrice) : undefined,
				percentage:
					gasNetGasPrice && oracleGasPrice
						? ((toGwei(gasNetGasPrice) - toGwei(oracleGasPrice)) / toGwei(oracleGasPrice)) * 100
						: undefined
			}
		})
	)

	onMount(async () => {
		const [onboardPromise, estimateReadChainsPromise, oracleChainsPromise] = await Promise.all([
			getOnboard(),
			fetchChains() as Promise<ReadChain[]>,
			fetchOracleChains() as Promise<OracleChain[]>
		])
		if (!estimateReadChainsPromise || !oracleChainsPromise) {
			throw new Error('Failed to fetch chains')
		}

		onboard = onboardPromise
		wallets$ = onboard.state.select('wallets').pipe(share())
		estimateChains = estimateReadChainsPromise
		oracleChains = oracleChainsPromise

		// OnMount get the queryParams from the URL and set the selectedEstimateNetwork and selectedOracleNetwork
		getQueryParams()
		intervalId = setInterval(getDeltaData, 5000)
	})

	// Cleanup subscriptions
	onDestroy(() => {
		subscriptions.forEach((sub) => sub.unsubscribe())
		clearInterval(intervalId)
	})

	// Setup subscriptions
	const subscriptions = [
		estimateDeltaData$.subscribe((result) => {
			if (!result) return
			gasNetEstimate.set(result.gasNet)
			oracleReading.set(result.oracle)
		}),
		timeElapsed2$.subscribe()
	]

	async function getDeltaData() {
		if (!$wallets$?.[0] || !selectedEstimateNetwork) return null

		const [gasNetResult, oracleResults] = await Promise.all([
			fetchGasEstimationFromGasNet(),
			readFromOracleDeltaDisplay($wallets$?.[0]?.provider)
		])
		// Use the next method to push new data into the Subject
		estimateDeltaData$.next({
			gasNet: gasNetResult,
			oracle: oracleResults
		})
	}

	const getQueryParams = () => {
		if (!estimateChains?.length || !oracleChains?.length) return
		const urlParams = new URLSearchParams(window.location.search)
		const oracleNetwork = urlParams.get('oracleNetwork')
		const estimateNetwork = urlParams.get('estimateNetwork')
		const estimateArch = urlParams.get('estimateArch') || 'evm'

		selectedEstimateNetwork = getEstimateChainById(
			estimateChains,
			Number(estimateNetwork),
			estimateArch
		)
		selectedOracleNetwork = getOracleChainById(oracleChains, Number(oracleNetwork))
	}

	function getTimeElapsed(timestamp: number) {
		if (!timestamp) return '> 1 Hour'
		const diff = Date.now() - timestamp
		const seconds = Math.floor(diff / 1000)
		const minutes = Math.floor(seconds / 60)
		const hours = Math.floor(minutes / 60)
		const remainingSeconds = seconds % 60

		if (hours > 0) return `${hours}h ago`
		if (minutes > 0) return `${minutes}m ${remainingSeconds}s ago`
		return `${seconds}s ago`
	}

	let ethersModule: typeof import('ethers')
	async function loadEthers() {
		if (!ethersModule) {
			ethersModule = await import('ethers')
		}
		return ethersModule
	}

	const hexToNumber = (hex: string): number => {
		return Number(BigInt(hex))
	}

	const toGwei = (value: number | bigint): number => Number(value) / 1e9

	async function fetchGasEstimationFromGasNet(stepUp?: boolean) {
		if (stepUp) {
			isLoading = true
			transactionHash = null
		}
		try {
			const { ethers } = await loadEthers()

			const rpcProvider = new ethers.JsonRpcProvider(gasNetwork.url)
			const gasNetContract = new ethers.Contract(gasNetwork.contract, gasnetV2.abi, rpcProvider)
			const chainId = selectedEstimateNetwork.chainId

			const { arch } = selectedEstimateNetwork
			const rawTargetNetworkData = await gasNetContract.getValues(archSchemaMap[arch], chainId)

			const paramsPayload = parsePayload(rawTargetNetworkData)

			if (!paramsPayload || !rawTargetNetworkData) {
				throw new Error(`Failed to fetch gas estimation: ${paramsPayload}`)
			}

			stepUp && currentStep.set(2)
			v2ContractRawRes = rawTargetNetworkData
			return paramsPayload
		} catch (error) {
			const revertErrorFromContract = (error as any)?.info?.error?.message
			console.error(error)
			readFromGasNetErrorMessage = revertErrorFromContract || (error as string)
			isLoading = false
			return null
		}
	}

	async function handleV2OracleValuesDisplayData(gasNetContract: Contract) {
		try {
			v2NoDataFoundErrorMsg = null

			const arch = archSchemaMap[selectedEstimateNetwork.arch]
			const { chainId, label } = selectedEstimateNetwork

			const typesByArch = getTypValuesByArch(arch, chainId)
			if (!typesByArch.length) {
				throw new Error(`No types found for arch: ${arch}, chainId: ${chainId}`)
			}
			console.log(typesByArch)
			const v2ValuesObject = await typesByArch.reduce(async (accPromise, typ) => {
				const acc = await accPromise
				const contractRespPerType = await gasNetContract.get(arch, chainId, typ)

				const [value, height, timestamp] = contractRespPerType
				if (value === 0n && height === 0n && timestamp === 0n) {
					v2NoDataFoundErrorMsg = `Estimate not available for ${label} at selected recency`
				}
				console.log(value)

				const resDataMap = evmTypeSchema?.[typ]
				if (!resDataMap) {
					console.error(
						`No resDataMap found within the Type Map Schema for arch: ${arch}, chainId: ${chainId}, typ: ${typ}`
					)
					return acc
				}

				return {
					...acc,
					// Added for validation
					[resDataMap.description]: (Number(value) / 1e9).toPrecision(4)
				}
			}, Promise.resolve({}))
			if (v2ValuesObject) {
				v2PublishedGasData = v2ValuesObject
			}
		} catch (error) {
			v2PublishedGasData = null
			isLoading = false
			console.error('Error Reading V2 Published Data:', error)
			const revertErrorFromContract = (error as any)?.info?.error?.message || (error as any)?.reason
			readFromTargetNetErrorMessage = revertErrorFromContract || (error as string)
		}
	}

	async function handleV2OracleValuesDeltaDisplay(gasNetContract: Contract) {
		try {
			const arch = archSchemaMap[selectedEstimateNetwork.arch]
			const { chainId, label } = selectedEstimateNetwork
			const typesByArch = getTypValuesByArch(arch, chainId)

			if (!typesByArch.length) {
				throw new Error(`No types found for arch: ${arch}, chainId: ${chainId}`)
			}
			return await typesByArch.reduce(async (accPromise, typ) => {
				const acc = await accPromise

				const contractRespPerType = await gasNetContract.get(arch, chainId, typ)

				const [value, height, timestamp] = contractRespPerType
				if (value === 0n && height === 0n && timestamp === 0n) {
					v2NoDataFoundErrorMsg = `Estimate not available for ${label} at selected recency`
				}

				const resDataMap = evmTypeSchema?.[typ]
				if (!resDataMap) {
					console.error(
						`No resDataMap found within the Type Map Schema for arch: ${arch}, chainId: ${chainId}, typ: ${typ}`
					)
					return acc
				}

				return {
					timestamp: Number(timestamp),
					...acc,
					// Added for validation
					[resDataMap.name]: Number(value)
				}
			}, Promise.resolve({}))
		} catch (error) {
			console.error('Error Reading Gas Estimate from Oracle:', error)
			const revertErrorFromContract = (error as any)?.info?.error?.message || (error as any)?.reason
			readFromTargetNetErrorMessage = revertErrorFromContract || (error as string)
		}
	}

	const readFromOracleDeltaDisplay = async (provider: any) => {
		try {
			const { ethers } = await loadEthers()
			const ethersProvider = new ethers.BrowserProvider(provider, 'any')
			const signer = await ethersProvider.getSigner()
			// TODO: make this reactive if we support more oracle versions in this dapp
			const contractAddress = selectedOracleNetwork.addressByVersion[SUPPORTED_ORACLE_VERSIONS]

			const gasNetContract = new ethers.Contract(contractAddress, consumerV2.abi, signer)

			return await handleV2OracleValuesDeltaDisplay(gasNetContract)
		} catch (error) {
			console.error('Error reading gas estimates from oracle:', error)
			const revertErrorFromContract = (error as any)?.info?.error?.message || (error as any)?.reason
			readFromTargetNetErrorMessage = revertErrorFromContract || (error as string)
		}
	}

	const readFromOracle = async (provider: any) => {
		try {
			readFromTargetNetErrorMessage = null
			await onboard.setChain({ chainId: selectedOracleNetwork.chainId })

			const { ethers } = await loadEthers()
			const ethersProvider = new ethers.BrowserProvider(provider, 'any')
			const signer = await ethersProvider.getSigner()
			// TODO: make this reactive if we support more oracle versions in this dapp
			const contractAddress = selectedOracleNetwork.addressByVersion[SUPPORTED_ORACLE_VERSIONS]

			const gasNetContract = new ethers.Contract(contractAddress, consumerV2.abi, signer)

			readGasDataFromTargetChainTime = new Date().toLocaleString(undefined, {
				timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				dateStyle: 'medium',
				timeStyle: 'long'
			})

			v2PublishedGasData = null
			handleV2OracleValuesDisplayData(gasNetContract)
		} catch (error) {
			v2PublishedGasData = null
			console.error('Gas data read published data error:', error)
			const revertErrorFromContract = (error as any)?.info?.error?.message || (error as any)?.reason
			readFromTargetNetErrorMessage = revertErrorFromContract || (error as string)
			isLoading = false
		}
	}

	async function publishGasEstimation(provider: any) {
		try {
			const { ethers } = await loadEthers()
			const ethersProvider = new ethers.BrowserProvider(provider, 'any')
			const signer = await ethersProvider.getSigner()
			// TODO: make this reactive if we support more oracle versions in this dapp
			const contractAddress = selectedOracleNetwork.addressByVersion[SUPPORTED_ORACLE_VERSIONS]

			const consumerContract = new ethers.Contract(contractAddress, consumerV2.abi, signer)

			let transaction = await consumerContract.storeValues(v2ContractRawRes)

			const receipt = await transaction.wait()
			currentStep.set(3)

			isLoading = false
			transactionHash = receipt.hash
			await readFromOracle(provider)
		} catch (error) {
			const revertErrorFromGasNetContract = (error as any)?.info?.error?.message
			console.error('Publication error:', error)
			publishErrorMessage = revertErrorFromGasNetContract || (error as string)
			isLoading = false
		}
	}

	async function handleGasEstimation(provider: any, OracleNetworkId: number) {
		publishErrorMessage = null
		readFromGasNetErrorMessage = null
		try {
			currentStep.set(1)

			await fetchGasEstimationFromGasNet(true)

			await onboard.setChain({ chainId: OracleNetworkId })
			await publishGasEstimation(provider)
		} catch (e) {
			console.error(e)
		}
	}

	function formatAddress(address: string | undefined): string {
		if (!address) return ''
		return `${address.slice(0, 6)}...${address.slice(-4)}`
	}
</script>

<main class="h-full min-h-[100vh] w-full bg-black p-4 font-sans text-white sm:p-6">
	<div
		class="mx-auto max-w-3xl rounded-xl border border-gray-800 bg-brandForeground p-6 shadow-2xl sm:p-8"
	>
		<div class="relative flex flex-col items-center justify-center">
			<div>
				<div class="flex w-64 items-center">
					{@html gasNetIcon}
				</div>
				<h1 class="mb-8 text-center text-5xl font-normal">Gas Network</h1>
			</div>
			<span
				class="absolute left-0 top-0 rounded-full border border-brandAction px-4 py-2 text-sm font-medium text-brandAction hover:bg-brandAction/10"
			>
				<a href="https://gasnetwork.notion.site/" target="_blank">Documentation</a>
			</span>
			{#if $wallets$?.[0]?.accounts?.[0]?.address}
				<span
					class="absolute right-0 top-0 rounded-full border border-gray-400 px-4 py-2 text-sm font-medium text-white"
				>
					{formatAddress($wallets$?.[0]?.accounts?.[0]?.address)}
				</span>
			{/if}
		</div>

		{#if onboard?.connectWallet && !$wallets$?.length}
			<div class="flex flex-col gap-2">
				<button
					class="w-full rounded-full bg-brandAction px-8 py-4 text-lg font-medium text-black transition-all hover:bg-brandAction/70"
					on:click={() => onboard.connectWallet()}
				>
					Connect Wallet
				</button>
			</div>
		{/if}

		{#if $wallets$}
			{#each $wallets$ as { provider }}
				<div class="flex flex-col gap-2 sm:gap-4">
					<!-- Display the results -->
					<div class="space-y-4">
						<!-- Last Updated Time -->
						<div class="text-sm text-gray-500">
							Oracle Last updated: {$timeElapsed2$}
						</div>

						<!-- Gas Values -->
						{#if $gasNetEstimate && $oracleReading}
							<div class="space-y-2">
								<!-- Delta Display -->
								{#if $gasDelta$}
									<div class="flex justify-between">
										<span>GasNet Estimate:</span>
										<span>{$gasDelta$.gasNetGasPrice} gwei</span>
									</div>
									<div class="flex justify-between">
										<span>Oracle Reading:</span>
										{#if $gasDelta$.oracleGasPrice}
											<span>{$gasDelta$.oracleGasPrice} gwei</span>
										{:else}
											<span>Not Yet Published For This Network</span>
										{/if}
									</div>
									{#if $gasDelta$.difference && $gasDelta$.percentage}
										<div class="flex justify-between font-medium">
											<span>Difference:</span>
											<span class={$gasDelta$.difference > 0 ? 'text-green-500' : 'text-red-500'}>
												{$gasDelta$.difference.toFixed(4)} gwei ({$gasDelta$.percentage.toFixed(
													2
												)}%)
											</span>
										</div>
									{/if}
								{/if}
							</div>
						{/if}
					</div>

					<div class="flex items-center justify-between gap-5">
						<div class="flex w-full flex-col gap-1">
							<label for="read-chain" class="ml-1 text-xs font-medium text-white"
								>Estimates For</label
							>
							<select
								id="read-chain"
								bind:value={selectedEstimateNetwork}
								class="w-full cursor-pointer rounded-lg border px-3 py-3 text-sm text-gray-800 hover:border-brandAction focus:border-brandAction focus:ring-2 focus:ring-brandAction/10"
							>
								{#each orderAndFilterReadChainsAlphabetically(estimateChains!) as chain}
									<option value={chain}>{chain.label}</option>
								{/each}
							</select>
						</div>
						<div class="flex w-full flex-col gap-1">
							<label for="write-chain" class="ml-1 text-xs font-medium text-white">Write To</label>
							<select
								id="write-chain"
								bind:value={selectedOracleNetwork}
								class="w-full cursor-pointer rounded-lg border px-3 py-3 text-sm text-gray-800 hover:border-brandAction focus:border-brandAction focus:ring-2 focus:ring-brandAction/10"
							>
								{#each orderAndFilterOraclesAlphabetically(oracleChains ?? []) as chain}
									<option value={chain}>{chain.label}</option>
								{/each}
							</select>
						</div>
					</div>
					<button
						class="w-full rounded-full bg-brandAction px-6 py-3 font-medium text-black transition-all hover:bg-brandAction/70"
						disabled={isLoading}
						class:disabled={isLoading}
						on:click={() => handleGasEstimation(provider, selectedOracleNetwork.chainId)}
					>
						Write {selectedEstimateNetwork.label} Estimations to {selectedOracleNetwork.label}
					</button>
					{#if $currentStep > 0}
						<StepIndicator {currentStep} />
					{/if}

					{#if isLoading}
						<div class="my-2 flex flex-col items-center gap-2">
							<div
								class="border-brandAccent/30 border-t-brandAccent h-14 w-14 animate-spin rounded-full border-4"
							></div>
							<p class="text-brandAccent/90 text-center sm:text-left">
								Please Check Connected Browser Wallet for Progress
							</p>
						</div>
					{/if}

					{#if transactionHash}
						<div class="my-4 flex flex-col gap-2">
							<p class="text-gray-600">Confirmation:</p>
							<a
								href={`${selectedOracleNetwork.blockExplorerUrl}/tx/${transactionHash}`}
								target="_blank"
								rel="noopener noreferrer"
								class="overflow-hidden text-ellipsis text-blue-500 hover:underline"
							>
								{`${selectedOracleNetwork.blockExplorerUrl}/tx/${transactionHash}`}
							</a>
						</div>
					{/if}
					{#if readFromGasNetErrorMessage}
						<div class="overflow-auto rounded-lg border border-red-500 p-4 text-red-500">
							{readFromGasNetErrorMessage}
						</div>
					{/if}
					{#if publishErrorMessage}
						<div class="overflow-auto rounded-lg border border-red-500 p-4 text-red-500">
							{publishErrorMessage}
						</div>
					{/if}

					<div class="flex w-full flex-col items-center justify-between gap-4">
						{#if v2PublishedGasData}
							{#if v2NoDataFoundErrorMsg}
								<div class="w-full overflow-auto rounded-lg border border-red-500 p-4 text-red-500">
									{v2NoDataFoundErrorMsg}
								</div>
							{:else}
								<div class="w-full text-left">
									Data read from {selectedOracleNetwork.label} at: {readGasDataFromTargetChainTime}
								</div>

								<div class="mx-2 my-4 flex w-full flex-col gap-2 pb-3 text-xs sm:text-sm">
									{#each Object.entries(v2PublishedGasData) as [key, value]}
										{#if value}
											<div class="flex justify-between gap-4 py-1">
												<span class="font-medium">{key}:</span>
												{#if key.includes('Fee') && selectedEstimateNetwork.arch === 'evm'}
													<span>{typeof value === 'bigint' ? value.toString() : value} gwei</span>
												{:else if key.includes('Fee') && selectedEstimateNetwork.arch === 'utxo'}
													<span>{typeof value === 'bigint' ? value.toString() : value} sats</span>
												{/if}
											</div>
										{/if}
									{/each}
								</div>
							{/if}
						{/if}
					</div>

					{#if readFromTargetNetErrorMessage}
						<div class="overflow-auto rounded-lg border border-red-500 p-4 text-red-500">
							{readFromTargetNetErrorMessage}
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</main>

<style>
	:root {
		--w3o-background-color: #1c1c1c;
		--w3o-text-color: #ffffff;
		--w3o-border-color: #333333;
		--w3o-action-color: #59fbf5;
		--w3o-border-radius: 0.75rem;
		--onboard-connect-sidebar-progress-background: #575757;
	}

	/* Update select styling */
	select {
		@apply border-gray-700 bg-brandForeground text-white;
		background-position: right 4px center; /* Move chevron 4px from the right */
	}

	/* If the above doesn't work, this is a more specific approach */
	select::-ms-expand {
		margin-right: 4px;
	}

	/* For webkit browsers */
	select {
		-webkit-appearance: none;
		background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
		background-position: right 4px center;
		background-repeat: no-repeat;
		background-size: 1.5em;
		padding-right: 2.5em;
	}

	/* Update pre/code blocks */
	pre {
		@apply border border-gray-700 bg-brandForeground text-gray-300;
	}

	/* Add subtle glow effect to main action buttons */
	button {
		box-shadow: 0 0 20px rgba(0, 248, 226, 0.1);
	}

	/* Improve scrollbar styling for the content area */
	:global(.overflow-x-auto::-webkit-scrollbar) {
		width: 8px;
		height: 8px;
	}

	:global(.overflow-x-auto::-webkit-scrollbar-track) {
		background: #1c1c1c;
		border-radius: 4px;
	}

	:global(.overflow-x-auto::-webkit-scrollbar-thumb) {
		background: #333;
		border-radius: 4px;
	}

	:global(.overflow-x-auto::-webkit-scrollbar-thumb:hover) {
		background: #444;
	}
</style>
