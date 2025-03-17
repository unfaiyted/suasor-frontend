<script lang="ts">
	import '../app.css';
	import SettingsPopover from '$lib/components/SettingsPopover.svelte';
	import HeaderBar from '$lib/components/layout/HeaderBar.svelte';
	import SideBar from '$lib/components/layout/SideBar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { ArrowRight, PanelRight } from '@lucide/svelte';
	let { children } = $props();
</script>

<div class="mx-auto grid w-full 2xl:max-w-[2000px]">
	<!-- Page -->
	<div class="mx-auto grid w-full grid-cols-[auto_1fr_auto]">
		<SideBar />
		<div class="container">
			<!-- Header -->
			<header><HeaderBar /></header>
			<!-- Main -->
			<div class="flex flex-row">
				<main class="col-span-1 w-full space-y-4 p-4 pt-0">
					{@render children()}
				</main>
				<aside class="bg-surface-100-900/20 sticky top-0 col-span-1 hidden h-dvh 2xl:block">
					<PanelRight />
				</aside>
			</div>
		</div>

		<!-- <SideBar /> -->
		<!-- Sidebar (Right) -->
		<!-- NOTE: hidden in smaller screen sizes -->
	</div>
	<!-- Footer -->
	<Footer />
</div>
