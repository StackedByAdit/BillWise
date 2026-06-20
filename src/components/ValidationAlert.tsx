export function ValidationAlert({
  messages,
}: {
  messages: string[]
}) {
  if (messages.length === 0) {
    return null
  }

  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      role="alert"
    >
      <p className="font-medium">Fix these issues before saving or downloading the PDF:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
