interface GoogleAuthLinkProps {
  label: string
  redirectTo?: string
  errorPath?: '/signin' | '/signup'
  startPath?: string
}

export function GoogleAuthLink({
  label,
  redirectTo = '/',
  errorPath = '/signin',
  startPath = '/api/auth/google/start',
}: GoogleAuthLinkProps) {
  const href =
    startPath === '/api/auth/google/start'
      ? `${startPath}?redirect=${encodeURIComponent(redirectTo)}&errorPath=${encodeURIComponent(errorPath)}`
      : startPath

  return (
    <a
      href={href}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-6 py-3 font-semibold text-foreground transition hover:bg-slate-50 hover:shadow-sm"
    >
      <span
        aria-hidden="true"
        className="flex h-5 w-5 items-center justify-center rounded-full text-sm font-bold text-blue-600"
      >
        G
      </span>
      {label}
    </a>
  )
}
