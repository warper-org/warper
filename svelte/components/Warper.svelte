<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import type { VirtualizerOptions } from '../../types/core';
  import { createVirtualizer } from '../hooks/createVirtualizer.svelte';

  interface Props extends VirtualizerOptions<T> {
    children: Snippet<[index: number]>;
    loadingPlaceholder?: Snippet;
    errorPlaceholder?: Snippet<[error: Error]>;
    onRendered?: () => void;
    class?: string;
    style?: string;
  }

  let {
    itemCount,
    estimateSize,
    overscan = 3,
    height,
    horizontal = false,
    children,
    loadingPlaceholder,
    errorPlaceholder,
    onRendered,
    class: className = '',
    style = '',
  }: Props = $props();

  const v = createVirtualizer<T>(() => ({
    itemCount,
    estimateSize,
    overscan,
    horizontal,
  }));

  // Exposed via `bind:this` so consumers can imperatively scroll.
  export function scrollToOffset(offset: number, behavior: ScrollBehavior = 'auto') {
    v.scrollToOffset(offset, behavior);
  }
  export function scrollToIndex(index: number, behavior: ScrollBehavior = 'auto') {
    v.scrollToIndex(index, behavior);
  }

  let firedRendered = false;
  $effect(() => {
    if (!v.isLoading && onRendered && !firedRendered) {
      firedRendered = true;
      onRendered();
    }
  });

  const containerHeight = $derived(typeof height === 'number' ? `${height}px` : (height ?? '100%'));

  const CONTAINER_STATIC =
    'width:100%; overflow:auto; position:relative; overscroll-behavior:contain; contain:strict;';
  const INNER_STATIC = 'width:100%; position:relative; pointer-events:none;';
  const VIEWPORT_STATIC = 'position:absolute; top:0; left:0; width:100%; will-change:transform;';
  const ROW_STATIC =
    'position:absolute; top:0; left:0; width:100%; contain:layout style paint; will-change:transform;';
</script>

{#if v.error}
  <div
    {@attach v.scrollElement}
    class={className}
    style={CONTAINER_STATIC + style}
    style:height={containerHeight}
  >
    {#if errorPlaceholder}
      {@render errorPlaceholder(v.error)}
    {:else}
      <div style="padding:20px; color:#ef4444;">Error: {v.error.message}</div>
    {/if}
  </div>
{:else if v.isLoading}
  <div
    {@attach v.scrollElement}
    class={className}
    style={CONTAINER_STATIC + style}
    style:height={containerHeight}
  >
    {#if loadingPlaceholder}
      {@render loadingPlaceholder()}
    {:else}
      <div style="padding:20px; color:#888;">Loading…</div>
    {/if}
  </div>
{:else}
  <div
    {@attach v.scrollElement}
    class={className}
    data-warper-container
    style={CONTAINER_STATIC + style}
    style:height={containerHeight}
  >
    <div
      data-warper-inner
      style={INNER_STATIC}
      style:height="{v.range.totalHeight || 1}px"
    >
      <div
        data-warper-viewport
        style={VIEWPORT_STATIC}
        style:transform="translateY({v.range.paddingTop}px)"
      >
        {#each v.range.items as itemIndex, i (itemIndex)}
          <div
            data-index={itemIndex}
            style={ROW_STATIC}
            style:transform="translateY({v.range.offsets[i]}px)"
            style:height="{v.range.sizes[i]}px"
          >
            {@render children(itemIndex)}
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
