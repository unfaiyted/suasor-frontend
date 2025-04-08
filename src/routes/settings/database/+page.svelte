<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    
    // Redirect to the main settings page but keep the URL
    onMount(() => {
        // This timeout ensures the redirect happens after the component is mounted
        setTimeout(() => {
            window.location.href = '/settings';
        }, 10);
    });
</script>

<div class="container mx-auto p-8">
    <h2 class="text-xl font-bold mb-4">Redirecting to Database Settings...</h2>
    <p>Please wait while you are redirected to the settings page.</p>
</div>