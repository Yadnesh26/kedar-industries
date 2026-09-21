## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Publishing to GitHub

This folder lives inside a parent working directory (`..`) that also holds
private business documents — PDFs, `.docx` files, `KEDAR-INDUSTRIES.md`,
`implementationplan.md`, `reference/`, `assets/` (source images), and
`private/`. **None of that should ever reach GitHub.** Only the contents of
this `kedar-industries-web/` folder are public.

The GitHub remote (`https://github.com/Yadnesh26/kedar-industries.git`) has
exactly one branch, `main`, and it must only ever contain this folder's
history — never the parent repo's.

To publish changes, run from the **parent** directory (`..`), not from here:

```
git branch -D website-only        # if it already exists locally
git subtree split --prefix=kedar-industries-web -b website-only
git push origin website-only:main
```

If the push is rejected as non-fast-forward, verify the local
`website-only` branch's tree really is website-only content
(`git ls-tree --name-only website-only`) before force-pushing — a
non-fast-forward usually means something else touched the remote out of
band, not that this workflow is wrong.

**Never run `git push origin master` or push the parent repo's own history
to this remote.** That has happened twice already and each time it
force-published the full monorepo — business documents included — to
GitHub. If you ever see a `master` branch (or anything besides `main`) on
this remote, delete it immediately:

```
git push origin --delete master
```
