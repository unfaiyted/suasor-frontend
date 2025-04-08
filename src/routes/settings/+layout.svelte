<script>
    import { page } from '$app/stores';
    import SettingsPage from './+page.svelte';
    
    // Extract the active tab from the URL
    $effect(() => {
        const path = $page.url.pathname;
        if (path !== '/settings') {
            const pathParts = path.split('/');
            if (pathParts.length > 2) {
                // We now have the tab in pathParts[2]
                // This will be passed to the settings page component
            }
        }
    });
</script>

<!-- Always render the main settings page component -->
<slot />