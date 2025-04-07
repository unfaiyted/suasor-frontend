<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { marked } from 'marked';

	interface StreamingTextProps {
		text: string;
		speed?: number; // ms per character
		minDuration?: number;
		maxDuration?: number;
		isComplete?: boolean;
	}

	// Props using Svelte 5 $props syntax
	let {
		text = '',
		speed = 25,
		minDuration = 1000,
		maxDuration = 3000,
		isComplete = $bindable(false)
	}: StreamingTextProps = $props();

	// State using Svelte 5 $state rune
	let displayedText = $state('');
	let displayedCharacters = $state(0);
	let animationInterval = $state<ReturnType<typeof setInterval> | null>(null);
	let isAnimating = $state(false);
	let chatContainer = $state<HTMLElement | null>(null);

	// Function to scroll both container and page during message streaming
	function scrollToMessage() {
		// Find the chat container
		const chatContainer = document.querySelector('.chat-container');
		if (!chatContainer) return;

		// Scroll the container to the bottom
		chatContainer.scrollTop = chatContainer.scrollHeight;

		// Also scroll the entire page to the bottom
		window.scrollTo({
			top: document.body.scrollHeight,
			behavior: 'smooth'
		});
	}

	function startAnimation() {
		if (!text || isAnimating) return;

		// Reset animation state
		isAnimating = true;
		isComplete = false;
		displayedCharacters = 0;

		// Calculate animation duration based on text length
		const charCount = text.length;
		const calculatedDuration = charCount * speed;
		const duration = Math.min(Math.max(calculatedDuration, minDuration), maxDuration);

		// Calculate timing
		const increment = 1;
		const intervalTime = duration / charCount;

		// Start animation
		animationInterval = setInterval(() => {
			displayedCharacters += increment;
			displayedText = text.substring(0, displayedCharacters);

			// Scroll to bottom on every text update for more consistent behavior
			scrollToMessage();

			if (displayedCharacters >= charCount) {
				// Animation complete
				clearInterval(animationInterval);
				displayedCharacters = charCount;
				displayedText = text;
				isAnimating = false;

				// Final scroll to keep message in view
				scrollToMessage();

				// Set isComplete
				isComplete = true;
				console.log('Text animation complete, isComplete set to true');
			}
		}, intervalTime);
	}

	function stopAnimation() {
		if (animationInterval) {
			clearInterval(animationInterval);
			animationInterval = null;
		}
		isAnimating = false;
		displayedText = text;
		displayedCharacters = text.length;
		isComplete = true;
	}

	function formatText(content: string): string {
		if (!content) return '';

		// Process with markdown
		try {
			if (
				content.includes('#') ||
				content.includes('*') ||
				content.includes('```') ||
				content.includes('|') ||
				(content.includes('[') && content.includes(']'))
			) {
				return marked(content);
			}
		} catch (error) {
			// console.error('Error parsing markdown:', error);
		}

		// If no markdown or parsing failed, just handle line breaks
		const lines = content.split('\n');

		// Keep normal paragraphs for all lines except the last one
		if (lines.length > 1) {
			return (
				lines
					.slice(0, -1)
					.map((line) => `<p>${line || ' '}</p>`)
					.join('') + `<p class="last-line">${lines[lines.length - 1] || ' '}</p>`
			);
		}

		// For single line text, just make it a "last-line" paragraph
		return `<p class="last-line">${content || ' '}</p>`;
	}

	// Use Svelte 5's effect rune for reactivity
	$effect(() => {
		if (text && text !== displayedText && !isAnimating) {
			startAnimation();
		}

		// If component is set to complete immediately, handle that
		if (isComplete && !isAnimating && displayedText !== text) {
			displayedText = text;
			displayedCharacters = text.length;
		}
	});

	// When component mounts, find the chat container
	onMount(() => {
		chatContainer = document.querySelector('.chat-container');
	});

	// Cleanup on destroy
	onDestroy(() => {
		if (animationInterval) {
			clearInterval(animationInterval);
		}
	});
</script>

<div class="streaming-text prose prose-sm dark:prose-invert max-w-none">
	<span class="inline">{@html formatText(displayedText)}</span>
	{#if isAnimating}
		<span class="cursor inline">|</span>
	{/if}
</div>

<style>
	.streaming-text :global(p) {
		display: block;
		margin-bottom: 0.5rem;
	}

	.streaming-text :global(p.last-line) {
		display: inline;
		margin-bottom: 0;
	}

	.cursor {
		display: inline-block;
		animation: blink 1s infinite;
		opacity: 0.7;
	}

	.inline {
		display: inline;
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}
</style>
