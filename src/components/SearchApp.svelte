<script lang="ts">
  import { onMount } from "svelte";
  import Result from "./Result.svelte";
  import type { Result as ResultType } from "src/types/result";
  import { Search } from "lucide-svelte";
  import DefaultView from "./DefaultView.svelte";
  import NotFoundView from "./NotFoundView.svelte";
  import { cleanUserInput } from "@lib/utils";

  let queryInput = $state("");
  let lastQuery = $state("");
  let results = $state<ResultType[]>([]);
  let loading = $state(false);

  let currentPage = $state(1);
  let totalPages = $state(1);
  const defaultPageSize = 10;
  let pageSize = $state(10);
  let totalResults = $state(0);

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const p = params.get("page");
    const s = params.get("size");

    if (q) {
      queryInput = q;
      if (p) currentPage = parseInt(p);
      if (s) pageSize = parseInt(s);
      search(currentPage, false);
    }
  });

  async function search(page = 1, updateUrl = true) {
    if (!queryInput.trim()) {
      results = [];
      lastQuery = "";
      currentPage = 1;

      if (updateUrl) {
        window.history.pushState({}, "", window.location.pathname);
      }
      return;
    }

    loading = true;
    lastQuery = queryInput;
    currentPage = page;

    try {
      const params = new URLSearchParams({
        q: lastQuery,
        page: currentPage.toString(),
        size: pageSize.toString(),
      });

      if (updateUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set("q", lastQuery);

        if (currentPage > 1)
          url.searchParams.set("page", currentPage.toString());
        else url.searchParams.delete("page");

        if (pageSize !== defaultPageSize)
          url.searchParams.set("size", pageSize.toString());
        else url.searchParams.delete("size");

        window.history.pushState({}, "", url);
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      results = data.results;
      totalPages = data.pagination.totalPages;
      totalResults = data.pagination.totalResults;
    } catch (e) {
      console.error("Search error:", e);
      results = [];
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col items-center w-full">
  <div class="form-control w-full mb-10">
    <div class="join w-full">
      <div class="w-full">
        <label
          class="input border-none bg-base-200 join-item w-full flex items-center gap-2"
        >
          <Search class="opacity-50" size={14} />
          <input
            type="text"
            placeholder="Search password for..."
            bind:value={queryInput}
            onkeydown={(e) => e.key === "Enter" && search(1)}
            required
          />
        </label>
      </div>
      <button
        class="btn btn-soft border join-item"
        disabled={loading}
        onclick={() => search(1)}
      >
        Search
        {#if loading}
          <span class="loading loading-spinner"></span>
        {/if}
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-6 w-full">
    {#if loading}
      <div class="col-span-full flex justify-center py-10">
        <span class="loading loading-dots loading-lg"></span>
      </div>
    {:else if lastQuery === ""}
      <DefaultView />
    {:else if results.length > 0}
      <ul class="list rounded-box">
        <li class="px-4 pb-2 text-xs opacity-60 tracking-wide">
          {totalResults} result{(totalResults > 1 && "s") || ""} for the query '{cleanUserInput(
            lastQuery,
          )}'
        </li>

        {#each results as result}
          <Result {result} />
        {/each}
      </ul>

      {#if totalPages > 1}
        <div class="join self-center mt-8 m-auto">
          <button
            class="join-item btn btn-md"
            disabled={currentPage === 1}
            onclick={() => search(currentPage - 1)}>«</button
          >
          <button class="join-item btn btn-md no-animation"
            >Page {currentPage} / {totalPages}</button
          >
          <button
            class="join-item btn btn-md"
            disabled={currentPage === totalPages}
            onclick={() => search(currentPage + 1)}>»</button
          >
        </div>
      {/if}
    {:else}
      <NotFoundView {lastQuery} />
    {/if}
  </div>
</div>
