export function AppHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-10 flex justify-center border-b border-line/60 bg-paper/85 shadow-[0_1px_8px_0_rgba(30,32,34,0.04)] backdrop-blur-md">
      <div className="flex h-16 w-full max-w-lg items-center justify-center px-4">
        <div className="flex items-center gap-1.5">
          <img src="/logo-header.png" alt="Kotoba" className="h-7 w-auto" />
          <span className="font-serif-jp text-xl text-ink">言葉</span>
        </div>
      </div>
    </header>
  )
}
