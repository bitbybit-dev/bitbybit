import React, { useState, useEffect, useCallback } from "react";
import styles from "./styles.module.css";

interface ImageGalleryProps {
  /** Array of image sources (paths or URLs) */
  images: string[];
  /** Number of columns in the grid (default: 2) */
  columns?: number;
  /** Alt text prefix — each image gets "{prefix} {index + 1}" (default: "Gallery image") */
  altPrefix?: string;
  /** Gap between images in CSS units (default: "1rem") */
  gap?: string;
}

export default function ImageGallery({
  images,
  columns = 2,
  altPrefix = "Gallery image",
  gap = "1rem",
}: ImageGalleryProps): React.JSX.Element {
  const [open, setOpen] = useState<number | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight")
        setOpen((open + 1) % images.length);
      if (e.key === "ArrowLeft")
        setOpen((open - 1 + images.length) % images.length);
    },
    [open, images.length],
  );

  useEffect(() => {
    if (open !== null) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  return (
    <>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
        }}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${altPrefix} ${i + 1}`}
            loading="lazy"
            className={styles.thumbnail}
            onClick={() => setOpen(i)}
          />
        ))}
      </div>

      {open !== null && (
        <div className={styles.overlay} onClick={() => setOpen(null)}>
          <img
            src={images[open]}
            alt={`${altPrefix} ${open + 1}`}
            className={styles.fullImage}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className={`${styles.navButton} ${styles.navLeft}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((open - 1 + images.length) % images.length);
            }}
            aria-label="Previous image"
          >
            ‹
          </button>

          <button
            className={`${styles.navButton} ${styles.navRight}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((open + 1) % images.length);
            }}
            aria-label="Next image"
          >
            ›
          </button>

          <button
            className={styles.closeButton}
            onClick={() => setOpen(null)}
            aria-label="Close"
          >
            ×
          </button>

          <span className={styles.counter}>
            {open + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
