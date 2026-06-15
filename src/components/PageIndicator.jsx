export default function PageIndicator({ order, titles, activeIndex }) {
  return (
    <div className="page-indicator" aria-label="Page position" role="presentation">
      {order.map((page, i) => (
        <span
          key={page}
          className={`pi-dot${i === activeIndex ? " is-active" : ""}`}
          title={titles[page]}
        />
      ))}
    </div>
  );
}
