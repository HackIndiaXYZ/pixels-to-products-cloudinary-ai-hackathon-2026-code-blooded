// A plain GET form: works before JavaScript loads, and every search is a shareable URL.
export function SearchBar({ defaultValue = "", autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form action="/search" role="search" className="relative">
      <label htmlFor="q" className="sr-only">
        Ask or search the library
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        minLength={2}
        maxLength={300}
        required
        placeholder="Ask anything from the library…"
        className="h-14 w-full rounded-2xl border border-border bg-surface pr-28 pl-5 text-base shadow-sm placeholder:text-muted"
      />
      <button className="absolute top-2 right-2 h-10 rounded-xl bg-accent px-5 font-medium text-accent-fg">Ask</button>
    </form>
  );
}
