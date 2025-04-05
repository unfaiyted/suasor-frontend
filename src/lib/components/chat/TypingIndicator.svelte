<script>
  // Animation settings
  export let showIndicator = false;
</script>

{#if showIndicator}
  <div class="typing-indicator-container">
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="sr-only">AI is thinking...</div>
  </div>
{/if}

<style>
  .typing-indicator-container {
    display: inline-flex;
    padding: 0.1rem 0.3rem;
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 0.5rem;
    margin: 0;
    vertical-align: baseline;
    line-height: 1;
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .typing-indicator span {
    width: 6px;
    height: 6px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    display: inline-block;
    animation: typing 1.4s infinite ease-in-out;
  }

  .typing-indicator span:nth-child(1) {
    animation-delay: 0s;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  :global(.dark) .typing-indicator span {
    background-color: rgba(255, 255, 255, 0.5);
  }

  @keyframes typing {
    0%, 100% {
      transform: translateY(0);
      opacity: 0.5;
    }
    50% {
      transform: translateY(-3px);
      opacity: 1;
    }
  }
</style>