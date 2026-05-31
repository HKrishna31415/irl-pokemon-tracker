<script>
  import { onMount } from 'svelte'
  import { readdata, getGameStore, read } from '$lib/store'
  import {
    isBattleRewardTransaction,
    opponentContextFromReward,
    refundTransactionPatch
  } from '$lib/utils/economy'
  import { Button } from '$c/core'
  import { Footer } from '$c/navs'

  let gameStore
  let rawData = {}
  let transactions = []
  let money = 0
  let receiptFilter = 'all'

  const receiptFilters = [
    { id: 'all', label: 'All' },
    { id: 'earn', label: 'Earning' },
    { id: 'spend', label: 'Spend' }
  ]

  onMount(() => {
    const [, , id] = readdata()
    gameStore = getGameStore(id)
    gameStore.subscribe(read((data) => {
      rawData = data
      money = data.__money || 0
      transactions = data.__transactions || []
    }))
  })

  const formatMoney = (value) => `$${Math.abs(value || 0).toLocaleString()}`
  const formatDate = (value) => value ? new Date(value).toLocaleString() : 'Unknown time'
  const signedMoney = (tx) => {
    const amount = tx.kind === 'earn' || tx.kind === 'refund' ? tx.total : -tx.total
    return `${amount >= 0 ? '+' : '-'}${formatMoney(amount)}`
  }

  const matchesReceiptFilter = (tx) => {
    if (receiptFilter === 'earn') return tx.kind === 'earn'
    if (receiptFilter === 'spend') return tx.kind === 'purchase' || tx.kind === 'consume'
    return true
  }

  const contextLabel = (context) => context?.name || 'Before first trainer'
  const contextKey = (context) => context?.rewardTransactionId || context?.id || 'before-first-trainer'

  const withDerivedOpponentContext = (items = []) => {
    const byId = {}
    let latestOpponent = null

    items
      .slice()
      .sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0))
      .forEach((tx) => {
        let context = tx.contextOpponent

        if (isBattleRewardTransaction(tx)) {
          context = context || opponentContextFromReward(tx)
          latestOpponent = context
        } else if (!context) {
          context = latestOpponent
        }

        byId[tx.id] = {
          ...tx,
          displayContextOpponent: context
        }
      })

    Object.values(byId).forEach((tx) => {
      if (tx.refundOf && !tx.displayContextOpponent) {
        tx.displayContextOpponent = byId[tx.refundOf]?.displayContextOpponent || null
      }
    })

    return items.map((tx) => byId[tx.id] || { ...tx, displayContextOpponent: null })
  }

  const groupSpendByOpponent = (items = []) => {
    const groups = []
    const groupRefs = {}

    items.forEach((tx) => {
      const key = contextKey(tx.displayContextOpponent)
      if (!groupRefs[key]) {
        groupRefs[key] = {
          key,
          context: tx.displayContextOpponent,
          total: 0,
          transactions: []
        }
        groups.push(groupRefs[key])
      }

      groupRefs[key].total += tx.total || 0
      groupRefs[key].transactions.push(tx)
    })

    return groups
  }

  $: enrichedTransactions = withDerivedOpponentContext(transactions)
  $: latestOpponent = enrichedTransactions.find(isBattleRewardTransaction)?.displayContextOpponent
  $: filteredTransactions = enrichedTransactions.filter(matchesReceiptFilter)
  $: spendGroups = receiptFilter === 'spend' ? groupSpendByOpponent(filteredTransactions) : []

  const canRefund = (tx) => {
    if (!tx || tx.kind !== 'purchase' || tx.refundedBy || tx.refundable === false) return false
    if (tx.itemType === 'token') return (rawData.__encounterTokens || 0) >= (tx.quantity || 1)
    return (rawData.__items?.[tx.itemId] || 0) >= (tx.quantity || 1)
  }

  const refund = (tx) => {
    if (!canRefund(tx)) return
    if (!window.confirm(`Refund ${tx.itemName} for ${formatMoney(tx.total)}?`)) return
    gameStore.update((raw) => JSON.stringify(refundTransactionPatch(JSON.parse(raw || '{}'), tx)))
  }
</script>

<div class="container mx-auto max-w-6xl p-4 pt-20 pb-32">
  <div class="rounded-2xl border bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4 dark:border-gray-800">
      <div>
        <h1 class="text-3xl font-bold">Receipts</h1>
        <p class="mt-1 text-sm text-gray-500">Purchase, reward, refund, and consumption history for this run.</p>
      </div>
      <div class="text-2xl font-mono font-bold text-lime-600 dark:text-lime-400">
        ${money.toLocaleString()}
      </div>
    </div>

    {#if latestOpponent}
      <div class="mb-6 rounded-xl border border-lime-200 bg-lime-50 p-4 dark:border-lime-900/70 dark:bg-lime-950/30">
        <div class="text-xs font-bold uppercase tracking-wider text-lime-700 dark:text-lime-300">Most recent beaten opponent</div>
        <div class="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div class="text-xl font-bold">{latestOpponent.itemName || 'Battle Reward'}</div>
            <div class="text-sm text-gray-500">{formatDate(latestOpponent.at)}</div>
          </div>
          <div class="text-right">
            <div class="font-mono text-2xl font-bold text-lime-600 dark:text-lime-400">+{formatMoney(latestOpponent.total)}</div>
            {#if latestOpponent.baseReward}
              <div class="text-xs text-gray-500">
                base {formatMoney(latestOpponent.baseReward)} · x{latestOpponent.multiplier || 1}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    {#if !transactions.length}
      <div class="py-20 text-center text-gray-500">No receipts yet.</div>
    {:else}
      <div class="mb-4 flex flex-wrap gap-2">
        {#each receiptFilters as filter}
          <button
            type="button"
            class="rounded-lg border px-4 py-2 text-sm font-bold transition {receiptFilter === filter.id
              ? 'border-lime-500 bg-lime-500 text-gray-950'
              : 'border-gray-300 text-gray-500 hover:border-lime-500 hover:text-lime-500 dark:border-gray-700'}"
            on:click={() => (receiptFilter = filter.id)}
          >
            {filter.label}
          </button>
        {/each}
      </div>

      {#if !filteredTransactions.length}
        <div class="rounded-xl border border-dashed py-16 text-center text-gray-500 dark:border-gray-800">
          No {receiptFilters.find((filter) => filter.id === receiptFilter)?.label.toLowerCase()} receipts yet.
        </div>
      {:else}
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="border-b text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800">
            <tr>
              <th class="py-3 pr-4">When</th>
              <th class="py-3 pr-4">Action</th>
              <th class="py-3 pr-4">Item / Reward</th>
              <th class="py-3 pr-4">After fight</th>
              <th class="py-3 pr-4">Details</th>
              <th class="py-3 pr-4 text-right">Money</th>
              <th class="py-3 text-right">Refund</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-800">
            {#if receiptFilter === 'spend'}
              {#each spendGroups as group}
                <tr class="bg-gray-50 dark:bg-gray-800/60">
                  <td colspan="7" class="py-3 px-4">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Spending after</span>
                        <span class="ml-2 font-bold">{contextLabel(group.context)}</span>
                      </div>
                      <div class="font-mono font-bold text-red-500">-{formatMoney(group.total)}</div>
                    </div>
                  </td>
                </tr>
                {#each group.transactions as tx}
              <tr class:opacity-50={tx.refundedBy}>
                <td class="py-3 pr-4 text-xs text-gray-500">{formatDate(tx.at)}</td>
                <td class="py-3 pr-4 font-bold capitalize">{tx.kind}</td>
                <td class="py-3 pr-4">
                  <div class="font-bold">{tx.itemName}</div>
                  <div class="text-xs text-gray-500">{tx.source}</div>
                </td>
                <td class="py-3 pr-4 text-xs font-bold text-gray-500">{contextLabel(tx.displayContextOpponent)}</td>
                <td class="py-3 pr-4 text-xs text-gray-500">
                  Qty {tx.quantity || 1}
                  {#if tx.baseReward}
                    · base {formatMoney(tx.baseReward)} · x{tx.multiplier}
                  {/if}
                  {#if tx.levelBefore !== undefined}
                    · Lv {tx.levelBefore} -> {tx.levelAfter}
                  {/if}
                  {#if tx.refundedBy}
                    · refunded
                  {/if}
                  {#if tx.refundOf}
                    · refund of {tx.refundOf.slice(0, 8)}
                  {/if}
                </td>
                <td class="py-3 pr-4 text-right font-mono font-bold {tx.kind === 'purchase' || tx.kind === 'consume' ? 'text-red-500' : 'text-lime-500'}">
                  {signedMoney(tx)}
                </td>
                <td class="py-3 text-right">
                  {#if canRefund(tx)}
                    <Button rounded on:click={() => refund(tx)}>Refund</Button>
                  {:else if tx.refundedBy}
                    <span class="text-xs font-bold uppercase text-gray-400">Refunded</span>
                  {:else}
                    <span class="text-xs text-gray-400">-</span>
                  {/if}
                </td>
              </tr>
                {/each}
              {/each}
            {:else}
            {#each filteredTransactions as tx}
              <tr class:opacity-50={tx.refundedBy}>
                <td class="py-3 pr-4 text-xs text-gray-500">{formatDate(tx.at)}</td>
                <td class="py-3 pr-4 font-bold capitalize">{tx.kind}</td>
                <td class="py-3 pr-4">
                  <div class="font-bold">{tx.itemName}</div>
                  <div class="text-xs text-gray-500">{tx.source}</div>
                </td>
                <td class="py-3 pr-4 text-xs font-bold text-gray-500">{contextLabel(tx.displayContextOpponent)}</td>
                <td class="py-3 pr-4 text-xs text-gray-500">
                  Qty {tx.quantity || 1}
                  {#if tx.baseReward}
                    · base {formatMoney(tx.baseReward)} · x{tx.multiplier}
                  {/if}
                  {#if tx.levelBefore !== undefined}
                    · Lv {tx.levelBefore} -> {tx.levelAfter}
                  {/if}
                  {#if tx.refundedBy}
                    · refunded
                  {/if}
                  {#if tx.refundOf}
                    · refund of {tx.refundOf.slice(0, 8)}
                  {/if}
                </td>
                <td class="py-3 pr-4 text-right font-mono font-bold {tx.kind === 'purchase' || tx.kind === 'consume' ? 'text-red-500' : 'text-lime-500'}">
                  {signedMoney(tx)}
                </td>
                <td class="py-3 text-right">
                  {#if canRefund(tx)}
                    <Button rounded on:click={() => refund(tx)}>Refund</Button>
                  {:else if tx.refundedBy}
                    <span class="text-xs font-bold uppercase text-gray-400">Refunded</span>
                  {:else}
                    <span class="text-xs text-gray-400">-</span>
                  {/if}
                </td>
              </tr>
            {/each}
            {/if}
          </tbody>
        </table>
      </div>
      {/if}
    {/if}
  </div>
  <Footer />
</div>
