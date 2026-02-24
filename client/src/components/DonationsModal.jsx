const VENMO_USERNAME = 'Seth-sanders-62';
const VENMO_URL = `https://venmo.com/u/${VENMO_USERNAME}`;

export default function DonationsModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-decode-card rounded-decode border border-decode-cardBorder shadow-decode-lg max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-decode-article mb-2">Support Decode</h2>
        <p className="text-sm text-decode-muted mb-4">
          If Decode has been useful to you, consider leaving a tip. Thanks!
        </p>
        <a
          href={VENMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-decode bg-[#008CFF] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Pay with Venmo — @{VENMO_USERNAME}
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 block text-sm text-decode-muted hover:text-decode-article hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
