<template>
  <div class="hero-demo-wrapper">
    <div class="demo-window">
      <div class="demo-titlebar">
        <span class="dot dot-red" />
        <span class="dot dot-yellow" />
        <span class="dot dot-green" />
        <span class="demo-title">Pull Request #42 — Add utils module</span>
      </div>

      <div class="demo-body">
        <!-- State 1: user types /codex-review -->
        <div class="demo-state state-1">
          <div class="gh-comment">
            <div class="gh-avatar">JB</div>
            <div class="gh-bubble">
              <div class="gh-meta">joeblackwaslike <span>just now</span></div>
              <div class="gh-text"><span class="cmd">/codex-review</span></div>
            </div>
          </div>
        </div>

        <!-- State 2: analyzing spinner -->
        <div class="demo-state state-2">
          <div class="analyzing">
            <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span>codex-review-bot is analyzing 3 files…</span>
          </div>
        </div>

        <!-- State 3: review appears -->
        <div class="demo-state state-3">
          <div class="gh-review">
            <div class="review-header">
              <span class="review-badge changes">Changes requested</span>
              <strong>codex-review-bot</strong>
            </div>
            <div class="review-summary">
              ### codex-review-bot<br /><br />
              Prototype pollution risk in <code>groupBy</code>. Use
              <code>Object.create(null)</code> or a <code>Map</code>.
              Inline comments: 2
            </div>
            <div class="inline-comment">
              <div class="inline-path">src/utils.ts +14</div>
              <div class="inline-body">
                Building result with <code>{}</code> allows prototype pollution
                when keys come from untrusted input.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Window chrome */
.demo-window {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.demo-titlebar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: var(--vp-c-bg-elv);
  border-bottom: 1px solid var(--vp-c-divider);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot-red    { background: #ff5f57; }
.dot-yellow { background: #febc2e; }
.dot-green  { background: #28c840; }

.demo-title {
  margin-left: 8px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

/* Animation container */
.demo-body {
  position: relative;
  height: 160px;
  overflow: hidden;
}

/* Three cycling states */
.demo-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 20px;
  opacity: 0;
  animation: cycle 9s infinite;
}

.state-1 { animation-delay: 0s; }
.state-2 { animation-delay: 3s; }
.state-3 { animation-delay: 6s; }

@keyframes cycle {
  0%   { opacity: 0; transform: translateY(4px); }
  8%   { opacity: 1; transform: translateY(0); }
  36%  { opacity: 1; transform: translateY(0); }
  44%  { opacity: 0; transform: translateY(-4px); }
  100% { opacity: 0; }
}

/* State 1: GitHub comment */
.gh-comment {
  display: flex;
  gap: 12px;
  width: 100%;
}

.gh-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.gh-bubble {
  flex: 1;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.gh-meta {
  padding: 6px 12px;
  background: var(--vp-c-bg-elv);
  font-size: 12px;
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
}

.gh-meta span { color: var(--vp-c-text-3); }

.gh-text {
  padding: 10px 12px;
  font-size: 14px;
}

.cmd {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* State 2: Analyzing */
.analyzing {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.spin {
  width: 20px;
  height: 20px;
  color: var(--vp-c-brand-1);
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

/* State 3: Review */
.gh-review {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.review-badge {
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.review-badge.changes {
  background: #fef3c7;
  color: #92400e;
}

.dark .review-badge.changes {
  background: #451a03;
  color: #fde68a;
}

.review-summary {
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.inline-comment {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  font-size: 12px;
}

.inline-path {
  padding: 4px 10px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
  border-bottom: 1px solid var(--vp-c-divider);
}

.inline-body {
  padding: 6px 10px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

@media (prefers-reduced-motion: reduce) {
  .demo-state {
    animation: none;
    opacity: 0;
  }
  .state-1 {
    opacity: 1;
  }
  .spin {
    animation: none;
  }
}
</style>
