interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({
  message,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-400/15 bg-red-400/5 px-4 py-3"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-sm text-red-300">!</span>

        <div>
          <p className="text-sm font-medium text-red-200">
            Something went wrong
          </p>

          <p className="mt-1 text-sm leading-6 text-red-200/65">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}