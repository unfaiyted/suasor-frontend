<script lang="ts">
	// Icons
	import IconFilm from '@lucide/svelte/icons/film';
	import IconTv from '@lucide/svelte/icons/tv';
	import IconMusic from '@lucide/svelte/icons/music';
	import IconMessageSquare from '@lucide/svelte/icons/message-square';
	import IconSettings from '@lucide/svelte/icons/settings';
	import IconGithub from '@lucide/svelte/icons/github';
	import IconTwitter from '@lucide/svelte/icons/twitter';

	const year = new Date().getFullYear();
</script>

<footer class="border-surface-50-950 bg-surface-100-900/30 border-t">
	<div class="container mx-auto px-4 py-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
			<!-- Brand/About -->
			<div class="space-y-2">
				<h3 class="text-lg font-bold">Suasor</h3>
				<p class="text-sm opacity-80">
					Your personal guide to discovering great content tailored to your tastes.
				</p>
			</div>

			<!-- Quick Links -->
			<div class="space-y-3">
				<h4 class="pb-1 font-semibold">Discover</h4>
				<ul class="space-y-2 text-sm">
					<li>
						<a
							href="/movies"
							class="flex items-center gap-2 opacity-80 transition hover:opacity-100"
							><IconFilm size={16} /> Movies</a
						>
					</li>
					<li>
						<a href="/tv" class="flex items-center gap-2 opacity-80 transition hover:opacity-100"
							><IconTv size={16} /> TV Shows</a
						>
					</li>
					<li>
						<a href="/music" class="flex items-center gap-2 opacity-80 transition hover:opacity-100"
							><IconMusic size={16} /> Music</a
						>
					</li>
				</ul>
			</div>

			<!-- Resources -->
			<div class="space-y-3">
				<h4 class="pb-1 font-semibold">Resources</h4>
				<ul class="space-y-2 text-sm">
					<li>
						<a
							href="/conversation"
							class="flex items-center gap-2 opacity-80 transition hover:opacity-100"
							><IconMessageSquare size={16} /> AI Chat</a
						>
					</li>
					<li>
						<a
							href="/settings"
							class="flex items-center gap-2 opacity-80 transition hover:opacity-100"
							><IconSettings size={16} /> Settings</a
						>
					</li>
				</ul>
			</div>

			<!-- Contact/Social -->
			<div class="space-y-3">
				<h4 class="pb-1 font-semibold">Connect</h4>
				<div class="flex gap-4">
					<a href="./" class="btn btn-sm variant-soft rounded-full"><IconGithub /></a>
					<a href="./" class="btn btn-sm variant-soft rounded-full"><IconTwitter /></a>
				</div>
			</div>
		</div>

		<div
			class="border-surface-950-50/30 mt-8 flex flex-col gap-2 border-t pt-4 text-sm opacity-70 md:flex-row md:justify-between"
		>
			<p>© {year} Suasor. All rights reserved.</p>
			<div class="flex gap-6">
				<a href="/privacy" class="hover:underline">Privacy</a>
				<a href="/terms" class="hover:underline">Terms</a>
			</div>
		</div>
	</div>
</footer>
