// Keyboard shortcut line under a question; hidden on touch screens by CSS.
export default function KeyHints({ options, children }) {
  return (
    <p className="keys">
      <kbd>1</kbd>–<kbd>{Math.min(9, options)}</kbd> toggle answers · {children}
    </p>
  );
}
