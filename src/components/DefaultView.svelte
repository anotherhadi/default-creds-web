<script lang="ts">
  import { onMount } from "svelte";
  import { Database, KeyRound, Github, Terminal, Heart } from "lucide-svelte";

  let totalApps = $state(0);
  let totalPasswords = $state(0);
  let loading = $state(true);

  onMount(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      totalApps = data.totalApps;
      totalPasswords = data.totalPasswords;
    } catch (e) {
      console.error("Stats error:", e);
    } finally {
      loading = false;
    }
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mx-auto">
  <div
    class="stats stats-vertical md:stats-horizontal bg-base-300 border border-white/5 md:col-span-2"
  >
    <div class="stat">
      <div class="stat-figure text-primary">
        <Database size={32} />
      </div>
      <div class="stat-title uppercase tracking-widest text-xs">
        Manufacturers
      </div>
      <div class="stat-value text-primary">{totalApps}</div>
      <div class="stat-desc">
        Add a new manufacturer <a
          href="https://github.com/anotherhadi/default-creds/blob/main/CONTRIBUTING.md"
          class="link link-hover text-primary">here</a
        >.
      </div>
    </div>

    <div class="stat">
      <div class="stat-figure text-secondary">
        <KeyRound size={32} />
      </div>
      <div class="stat-title uppercase tracking-widest text-xs">
        Credentials
      </div>
      <div class="stat-value text-secondary">{totalPasswords}</div>
      <div class="stat-desc">
        Full list available <a
          href="https://github.com/anotherhadi/default-creds/blob/main/data"
          class="link link-hover text-secondary">here</a
        >.
      </div>
    </div>
  </div>

  <div class="card bg-base-200 border border-white/5">
    <div class="card-body">
      <h2
        class="card-title text-primary font-mono uppercase text-sm tracking-widest"
      >
        <Terminal size={18} /> The Mission
      </h2>
      <p class="text-sm opacity-80 leading-relaxed">
        A centralized repository of factory-set credentials. Designed for <b
          >pentesters</b
        > and security researchers to identify default access points during engagements
        or infrastructure audits.
      </p>
    </div>
  </div>

  <div class="card bg-base-200 border border-white/5">
    <div class="card-body">
      <h2
        class="card-title text-secondary font-mono uppercase text-sm tracking-widest"
      >
        <Database size={18} /> How it Works
      </h2>
      <p class="text-sm opacity-80 leading-relaxed">
        This open-source app parses structured <b>YAML</b> files. It performs real-time
        searches across service names and versions via a lightweight astro engine.
      </p>
    </div>
  </div>

  <div class="card bg-base-200 border border-white/5 md:col-span-2">
    <div class="card-body flex-col md:flex-row items-center gap-6">
      <div class="flex-1">
        <h2
          class="card-title text-accent font-mono uppercase text-sm tracking-widest"
        >
          <Heart size={18} /> Community Driven
        </h2>
        <p class="text-sm opacity-80 leading-relaxed">
          Security is a collective effort. Contribute by adding new YAML
          definitions for missing devices or updating existing ones directly via
          Pull Requests on GitHub.
        </p>
      </div>
      <div class="card-actions">
        <a
          href="https://github.com/anotherhadi/default-creds/blob/main/CONTRIBUTING.md"
          class="btn btn-outline btn-accent btn-sm"
        >
          <Github size={16} /> Contribute
        </a>
      </div>
    </div>
  </div>
</div>
<p class="text-base-content/20 m-auto text-center text-xs"><a href="/privacy-policy">Privacy policy</a></p>
