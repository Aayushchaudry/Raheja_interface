import { useEffect } from "react";
import MediaPlaceholder from "./MediaPlaceholder.jsx";

export default function MediaModal({ title, onClose }) {
  useEffect(() => {
    if (!title) return undefined;

    const handleKeydown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [title, onClose]);

  if (!title) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Media placeholder"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="icon-button modal-close" type="button" aria-label="Close" onClick={onClose}>
          x
        </button>
        <MediaPlaceholder label={`${title} placeholder`} variant="video" />
      </div>
    </div>
  );
}
