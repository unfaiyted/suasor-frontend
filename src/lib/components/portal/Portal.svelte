<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface PortalProps {
		target?: string;
	}

	// Portal target ID
	let { target = 'portal' }: PortalProps = $props();

	// DOM reference to the portal content
	let ref;
	let targetElement;

	onMount(() => {
		// Find or create the target element
		targetElement = document.getElementById(target);
		if (!targetElement) {
			targetElement = document.createElement('div');
			targetElement.id = target;
			document.body.appendChild(targetElement);
		}

		// Move our content to the target
		if (ref && targetElement) {
			targetElement.appendChild(ref);
		}

		return () => {
			if (ref && ref.parentNode) {
				ref.parentNode.removeChild(ref);
			}
		};
	});
</script>

<div bind:this={ref} style="display:contents;">
	<slot />
</div>
