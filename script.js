document.addEventListener("DOMContentLoaded", () => {
    /* =========================================================
       1. MOBILE MENU TOGGLE WITH DYNAMIC ICON CHANGE
    ========================================================= */
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-menu a");

    if (menuToggle && navMenu) {
        const toggleIcon = menuToggle.querySelector("i");

        menuToggle.addEventListener("click", () => {
            const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", !isExpanded);
            menuToggle.classList.toggle("active");
            navMenu.classList.toggle("active");

            // Change icon between Bars and Close (X)
            if (toggleIcon) {
                if (navMenu.classList.contains("active")) {
                    toggleIcon.className = "fa-solid fa-xmark";
                } else {
                    toggleIcon.className = "fa-solid fa-bars";
                }
            }
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.classList.remove("active");
                navMenu.classList.remove("active");

                if (toggleIcon) {
                    toggleIcon.className = "fa-solid fa-bars";
                }
            });
        });
    }

    /* =========================================================
       2. NAVBAR SCROLL EFFECT & ACTIVE SECTION HIGHLIGHT
    ========================================================= */
    const navbar = document.querySelector(".navbar");
    const sections = document.querySelectorAll("section[id]");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

        let currentSectionId = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });
    });

    /* =========================================================
       3. VIDEO CONTROLS & PLAY BUTTONS
    ========================================================= */
    const videoCards = document.querySelectorAll(".video-card");
    const allVideos = document.querySelectorAll(".video-card video");

    videoCards.forEach((card) => {
        const video = card.querySelector("video");
        const playBtn = card.querySelector(".play-button");

        if (video && playBtn) {
            const hidePlayBtn = () => {
                playBtn.style.opacity = "0";
                playBtn.style.pointerEvents = "none";
            };

            const showPlayBtn = () => {
                playBtn.style.opacity = "1";
                playBtn.style.pointerEvents = "auto";
            };

            // Our big custom button just presses play; the native controls
            // bar (bottom of the video) then handles pause/seek/volume.
            playBtn.addEventListener("click", () => {
                video.play();
            });

            // Stay in sync no matter how playback starts/stops - our custom
            // button, the native controls, or the keyboard.
            video.addEventListener("play", () => {
                // Only one video plays at a time.
                allVideos.forEach((v) => {
                    if (v !== video) v.pause();
                });
                hidePlayBtn();
            });

            video.addEventListener("pause", showPlayBtn);

            // Reset to the start on end so the video can always be
            // rewatched from the beginning instead of getting stuck.
            video.addEventListener("ended", () => {
                video.currentTime = 0;
                showPlayBtn();
            });
        }
    });

    /* =========================================================
       4. DESIGN GALLERY - TIGHT MASONRY PACKING
       (Each card's grid-row-end is computed from its actual
       rendered height, so cards pack tightly with no gaps -
       recalculated on load and on resize.)
    ========================================================= */
    const designGrid = document.querySelector(".design-grid");

    if (designGrid) {
        const packDesignGrid = () => {
            const gridStyles = window.getComputedStyle(designGrid);
            const rowHeight = parseFloat(gridStyles.getPropertyValue("grid-auto-rows")) || 1;
            const rowGap = parseFloat(gridStyles.getPropertyValue("gap")) || 0;

            designGrid.querySelectorAll(".design-card").forEach((card) => {
                const img = card.querySelector("img");
                if (!img) return;
                // Measure the image, not the card: the card's own height is
                // controlled by the grid row span we're about to set, so
                // measuring the card gives a circular, always-tiny result.
                // The image's height is set purely by its aspect ratio at
                // the current column width, so it's safe to measure.
                const contentHeight = img.getBoundingClientRect().height + 2; // +2px for the card's top/bottom border
                const rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
                card.style.gridRowEnd = `span ${rowSpan}`;
            });
        };

        const galleryImages = designGrid.querySelectorAll("img");
        let loadedCount = 0;

        const onImageReady = () => {
            loadedCount++;
            if (loadedCount === galleryImages.length) packDesignGrid();
        };

        galleryImages.forEach((img) => {
            if (img.complete) {
                onImageReady();
            } else {
                img.addEventListener("load", onImageReady);
                img.addEventListener("error", onImageReady);
            }
        });

        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(packDesignGrid, 150);
        });
    }

    /* =========================================================
       5. DESIGN GALLERY LIGHTBOX
    ========================================================= */
    const lightbox = document.querySelector(".lightbox");
    const lightboxImg = lightbox ? lightbox.querySelector("img") : null;
    const lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
    const designCards = document.querySelectorAll(".design-card img");

    if (lightbox && lightboxImg) {
        designCards.forEach((img) => {
            img.addEventListener("click", () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || "Design Preview";
                lightbox.classList.add("active");
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove("active");
            lightboxImg.src = "";
        };

        if (lightboxClose) {
            lightboxClose.addEventListener("click", closeLightbox);
        }

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && lightbox.classList.contains("active")) {
                closeLightbox();
            }
        });
    }

    /* =========================================================
       6. SCROLL REVEAL ANIMATIONS
    ========================================================= */
    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            root: null,
            threshold: 0.15,
        }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
});