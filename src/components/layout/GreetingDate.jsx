const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

export default function GreetingDate() {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-base font-semibold text-[var(--text-primary)]">{getGreeting()}</span>
      <span className="text-xs text-[var(--text-muted)]">{capitalize(dateFormatter.format(new Date()))}</span>
    </div>
  )
}
