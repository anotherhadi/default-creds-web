<script lang="ts">
  import { Search, Book, Github, User, Shield, Menu } from "lucide-svelte";
  import type { Snippet } from "svelte";

  let {
    action,
  }: {
    title?: string;
    action?: Snippet;
  } = $props();

  const navLinks = [
    { label: "Search", href: "/", icon: Search },
    { label: "API", href: "/api-docs", icon: Book },
    {
      label: "More",
      children: [
        {
          label: "Source code",
          href: "https://github.com/anotherhadi/default-creds-web",
          icon: Github,
        },
        {
          label: "Passwords list",
          href: "https://github.com/anotherhadi/default-creds/blob/main/data",
          icon: Shield,
        },
        { label: "About me", href: "https://hadi.icu", icon: User },
      ],
    },
  ];
</script>

<div class="bg-base-200">
  <div class="navbar max-w-5xl m-auto">
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <Menu size={20} />
        </div>
        <ul
          tabindex="-1"
          class="menu menu-sm dropdown-content bg-base-300 rounded-box z-50 mt-3 w-52 p-2"
        >
          {#each navLinks as link}
            <li>
              {#if link.children}
                <span>{link.label}</span>
                <ul class="p-2">
                  {#each link.children as sublink}
                    <li>
                      <a href={sublink.href} class="flex items-center gap-2">
                        {#if sublink.icon}
                          {@const Icon = sublink.icon}
                          <Icon size={12} />
                        {/if}
                        {sublink.label}
                      </a>
                    </li>
                  {/each}
                </ul>
              {:else}
                <a href={link.href} class="flex items-center gap-2">
                  {#if link.icon}
                    {@const Icon = link.icon}
                    <Icon size={12} />
                  {/if}
                  {link.label}
                </a>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
      <a
        href="/"
        class="btn btn-ghost text-xl flex justify-center gap-4 items-center"
      >
        <img src="/logo.svg" class="m-auto h-6" alt="iky logo" />
        <img src="/logo-large.svg" class="m-auto h-6" alt="iky logo large" />
      </a>
    </div>

    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        {#each navLinks as link}
          <li>
            {#if link.children}
              <details>
                <summary>{link.label}</summary>
                <ul class="p-2 bg-base-300 w-52 z-50">
                  {#each link.children as sublink}
                    <li>
                      <a href={sublink.href} class="flex items-center gap-2">
                        {#if sublink.icon}
                          {@const Icon = sublink.icon}
                          <Icon size={12} />
                        {/if}
                        {sublink.label}
                      </a>
                    </li>
                  {/each}
                </ul>
              </details>
            {:else}
              <a href={link.href} class="flex items-center gap-2">
                {#if link.icon}
                  {@const Icon = link.icon}
                  <Icon size={14} />
                {/if}
                {link.label}
              </a>
            {/if}
          </li>
        {/each}
      </ul>
    </div>

    <div class="navbar-end">
      {@render action?.()}
    </div>
  </div>
</div>
