<script lang="ts">
	export let isLoading = false;
</script>

<div class="mt-6">
	<button
		type="submit"
		class="btn preset-filled-primary-500 w-full {isLoading ? 'loading' : ''}"
		disabled={isLoading}
	>
		{isLoading ? 'Saving...' : 'Save Changes'}
	</button>
</div>
