export default function MediaPlaceholder({ label, variant = "", className = "" }) {
  const variantClass = variant ? ` media-placeholder--${variant}` : "";

  return (
    <div className={`media-placeholder${variantClass}${className ? ` ${className}` : ""}`}>
      <span>{label}</span>
    </div>
  );
}
