export default function ActionButton({ children, variant = "ghost", onClick }) {
  return (
    <button className={`${variant}-action`} type="button" onClick={onClick}>
      {children}
    </button>
  );
}
