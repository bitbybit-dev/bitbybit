import React, { useState, useEffect, useCallback, useRef } from "react";
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

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;
const WHEEL_ZOOM_STEP = 0.2;

export default function ImageGallery({
  images,
  columns = 2,
  altPrefix = "Gallery image",
  gap = "1rem",
}: ImageGalleryProps): React.JSX.Element {
  const [open, setOpen] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
  }, []);

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const handleZoomIn = useCallback(() => {
    setZoom((z) => {
      const next = clampZoom(z + ZOOM_STEP);
      zoomRef.current = next;
      return next;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const next = clampZoom(z - ZOOM_STEP);
      zoomRef.current = next;
      if (next === 1) {
        setPan({ x: 0, y: 0 });
        panRef.current = { x: 0, y: 0 };
      }
      return next;
    });
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const curZoom = zoomRef.current;
    const curPan = panRef.current;
    const next = clampZoom(curZoom + (e.deltaY < 0 ? WHEEL_ZOOM_STEP : -WHEEL_ZOOM_STEP));

    if (next === 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      zoomRef.current = 1;
      panRef.current = { x: 0, y: 0 };
      return;
    }

    // Point under cursor in world space
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    const worldX = (mouseX - curPan.x) / curZoom;
    const worldY = (mouseY - curPan.y) / curZoom;

    // Adjust pan so the same world point stays under cursor
    const newPan = {
      x: mouseX - worldX * next,
      y: mouseY - worldY * next,
    };

    zoomRef.current = next;
    panRef.current = newPan;
    setZoom(next);
    setPan(newPan);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoomRef.current <= 1) return;
      e.preventDefault();
      e.stopPropagation();
      dragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { ...panRef.current };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      e.stopPropagation();
      const newPan = {
        x: panStart.current.x + (e.clientX - dragStart.current.x),
        y: panStart.current.y + (e.clientY - dragStart.current.y),
      };
      panRef.current = newPan;
      setPan(newPan);
    },
    [],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "Escape") {
        if (zoom > 1) {
          resetZoom();
        } else {
          setOpen(null);
        }
      }
      if (e.key === "ArrowRight") {
        resetZoom();
        setOpen((open + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        resetZoom();
        setOpen((open - 1 + images.length) % images.length);
      }
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-" || e.key === "_") handleZoomOut();
      if (e.key === "0") resetZoom();
    },
    [open, zoom, images.length, handleZoomIn, handleZoomOut, resetZoom],
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

  useEffect(() => {
    const el = wrapperRef.current;
    if (open !== null && el) {
      el.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (el) {
        el.removeEventListener("wheel", handleWheel);
      }
    };
  }, [open, handleWheel]);

  const handleClose = useCallback(() => {
    resetZoom();
    setOpen(null);
  }, [resetZoom]);

  const handleNav = useCallback(
    (dir: 1 | -1) => {
      resetZoom();
      setOpen((prev) => (prev + dir + images.length) % images.length);
    },
    [images.length, resetZoom],
  );

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
        <div className={styles.overlay} onClick={handleClose}>
          <div
            ref={wrapperRef}
            className={styles.imageWrapper}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[open]}
              alt={`${altPrefix} ${open + 1}`}
              className={styles.fullImage}
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                cursor: zoom > 1 ? "grab" : "default",
              }}
              draggable={false}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
          </div>

          <div className={styles.zoomControls}>
            <button
              className={styles.zoomButton}
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom out"
            >
              −
            </button>
            <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
            <button
              className={styles.zoomButton}
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
            >
              +
            </button>
            {zoom > 1 && (
              <button
                className={styles.zoomButton}
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoom();
                }}
                aria-label="Reset zoom"
              >
                ⟲
              </button>
            )}
          </div>

          {images.length > 1 && (
            <button
              className={`${styles.navButton} ${styles.navLeft}`}
              onClick={(e) => {
                e.stopPropagation();
                handleNav(-1);
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {images.length > 1 && (
            <button
              className={`${styles.navButton} ${styles.navRight}`}
              onClick={(e) => {
                e.stopPropagation();
                handleNav(1);
              }}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>

          {images.length > 1 && (
            <span className={styles.counter}>
              {open + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
