export default function ConfirmModal({ open, onClose, text, onConfirm }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6">
                <p className="text-center text-lg font-medium mb-6">{text}</p>
                <div className="flex justify-center gap-3">
                    <button onClick={onConfirm} className="bg-green-600 text-white px-6 py-2 rounded">
                        네
                    </button>
                    <button onClick={onClose} className="bg-gray-200 px-6 py-2 rounded">
                        아니요
                    </button>
                </div>
            </div>
        </div>
    );
}
