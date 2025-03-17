<!-- LoadingSpinner.svelte -->
<script>
	export let size = 40;
</script>

<div class="flex h-64 items-center justify-center">
	<div class="loader" style="width: {size}px; height: {size}px;"></div>
</div>

<style>
	.loader {
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-left-color: #646cff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
