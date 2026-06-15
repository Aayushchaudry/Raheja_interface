export default function NavArrows({ showPrev, showNext, nextLabel, onPrev, onNext }) {
  return (
    <>
      {showPrev ? (
        <button className="nav-arrow-left" type="button" aria-label="Previous" onClick={onPrev}>
          <span className="arrow-circle">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 8H4M4 8L8 4M4 8L8 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      ) : null}

      {showNext ? (
        <button className="nav-arrow-right" type="button" aria-label="Next" onClick={onNext}>
          <span className="arrow-circle">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 9H14M14 9L9 4M14 9L9 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </span>
          {nextLabel ? <span className="arrow-label">{nextLabel}</span> : null}
        </button>
      ) : null}
    </>
  );
}
