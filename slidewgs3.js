 (function () {
      const sliderTrack = document.getElementById("apg-slider-track");
      const lightbox = document.getElementById("apg-lightbox");
      const lightboxImg = document.getElementById("apg-lightbox-img");
      const lightboxCaption = document.getElementById("apg-lightbox-caption");
      const lightboxClose = document.getElementById("apg-lightbox-close");
      const prevBtn = document.getElementById("apg-prev-btn");
      const nextBtn = document.getElementById("apg-next-btn");
      const lightboxPrev = document.getElementById("apg-lightbox-prev");
      const lightboxNext = document.getElementById("apg-lightbox-next");
      const zoomInBtn = document.getElementById("apg-zoom-in");
      const zoomOutBtn = document.getElementById("apg-zoom-out");
      const zoomResetBtn = document.getElementById("apg-zoom-reset");

      // Gap in px between slides
      const gapPx = 16;

      // Determine how many slides to show based on viewport width
      function getSlidesToShow() {
        const width = window.innerWidth;
        if (width >= 768) return 2;
        if (width >= 640) return 1;
        return 1;
      }

      let currentIndex = 0;
      let slidesToShow = getSlidesToShow();
      let autoplayInterval = null;
      const autoplayDelay = 4000; // 4 seconds

      // Lightbox current index and zoom level
      let lightboxIndex = 0;
      let zoomLevel = 1;
      const zoomStep = 0.2;
      const zoomMin = 1;
      const zoomMax = 3;

      // Variables for pan
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let imgTranslateX = 0;
      let imgTranslateY = 0;

      // Variables for pinch zoom
      let initialDistance = null;
      let initialZoom = 1;
      let lastTouchMidpoint = null;

      // Create slide card element
      function createCard(item, index) {
        const article = document.createElement("article");
        article.className = "apg-slide";
        article.tabIndex = 0;
        article.setAttribute("role", "button");
        article.setAttribute("aria-label", `View image: ${item.title}`);

        const img = document.createElement("img");
        img.src = item.imgSrc;
        img.alt = item.imgAlt;
        img.loading = "lazy";

        const h3 = document.createElement("h3");
        h3.textContent = item.title;

        const btn = document.createElement("button");
        btn.textContent = "View";
        btn.setAttribute("aria-label", `View image: ${item.title}`);

        function open() {
          openLightbox(index);
        }

        article.addEventListener("click", open);
        article.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        });
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          open();
        });

        article.appendChild(img);
        article.appendChild(h3);
        article.appendChild(btn);

        return article;
      }

      // Render slides
      function renderSlides() {
        sliderTrack.innerHTML = "";
        slidesToShow = getSlidesToShow();

        // Calculate container width and slide width
        const containerWidth = sliderTrack.parentElement.clientWidth;
        const totalGapWidth = gapPx * (slidesToShow - 1);
        const slideWidthPx = (containerWidth - totalGapWidth) / slidesToShow;
        const slideWidthPercent = (slideWidthPx / containerWidth) * 100;

        data.forEach((item, index) => {
          const card = createCard(item, index);
          card.style.minWidth = `${slideWidthPercent}%`;
          card.style.marginRight = index === data.length - 1 ? "0" : `${gapPx}px`;
          sliderTrack.appendChild(card);
        });

        updateSliderPosition();
        updateNavButtons();
      }

      // Update slider position based on currentIndex
      function updateSliderPosition() {
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > data.length - slidesToShow) currentIndex = data.length - slidesToShow;
        if (currentIndex < 0) currentIndex = 0;

        const containerWidth = sliderTrack.parentElement.clientWidth;
        const slideWidthPx = (containerWidth - gapPx * (slidesToShow - 1)) / slidesToShow;
        const translateXpx = currentIndex * (slideWidthPx + gapPx);

        sliderTrack.style.transform = `translateX(-${translateXpx}px)`;
        updateNavButtons();
      }

      // Enable/disable nav buttons
      function updateNavButtons() {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= data.length - slidesToShow;
      }

      prevBtn.addEventListener("click", () => {
        currentIndex--;
        updateSliderPosition();
        resetAutoplay();
      });

      nextBtn.addEventListener("click", () => {
        currentIndex++;
        updateSliderPosition();
        resetAutoplay();
      });

      window.addEventListener("resize", () => {
        const oldSlidesToShow = slidesToShow;
        slidesToShow = getSlidesToShow();
        if (oldSlidesToShow !== slidesToShow) {
          if (currentIndex > data.length - slidesToShow) {
            currentIndex = data.length - slidesToShow;
            if (currentIndex < 0) currentIndex = 0;
          }
          renderSlides();
        } else {
          renderSlides();
        }
      });

      // Autoplay functions
      function startAutoplay() {
        if (autoplayInterval) return;
        autoplayInterval = setInterval(() => {
          if (currentIndex < data.length - slidesToShow) {
            currentIndex++;
          } else {
            currentIndex = 0;
          }
          updateSliderPosition();
        }, autoplayDelay);
      }

      function stopAutoplay() {
        if (autoplayInterval) {
          clearInterval(autoplayInterval);
          autoplayInterval = null;
        }
      }

      function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
      }

      // Initial render and autoplay start
      renderSlides();
      startAutoplay();

      // Lightbox functions
      function openLightbox(index) {
        lightboxIndex = index;
        zoomLevel = 1;
        imgTranslateX = 0;
        imgTranslateY = 0;
        updateLightbox();
        lightbox.classList.add("active");
        lightbox.focus();
        document.body.style.overflow = "hidden";
        stopAutoplay();
      }

      function updateLightbox() {
        const item = data[lightboxIndex];
        lightboxImg.src = item.imgSrc;
        lightboxImg.alt = item.imgAlt;
        lightboxCaption.textContent = item.title;
        updateTransform();
        updateLightboxNavButtons();
      }

      function closeLightbox() {
        lightbox.classList.remove("active");
        lightboxImg.src = "";
        lightboxCaption.textContent = "";
        zoomLevel = 1;
        imgTranslateX = 0;
        imgTranslateY = 0;
        updateTransform();
        document.body.style.overflow = "";
        startAutoplay();
      }

      function updateLightboxNavButtons() {
        lightboxPrev.disabled = lightboxIndex === 0;
        lightboxNext.disabled = lightboxIndex === data.length - 1;
      }

      function showPrevLightbox() {
        if (lightboxIndex > 0) {
          lightboxIndex--;
          zoomLevel = 1;
          imgTranslateX = 0;
          imgTranslateY = 0;
          updateLightbox();
        }
      }

      function showNextLightbox() {
        if (lightboxIndex < data.length - 1) {
          lightboxIndex++;
          zoomLevel = 1;
          imgTranslateX = 0;
          imgTranslateY = 0;
          updateLightbox();
        }
      }

      function updateTransform() {
        lightboxImg.style.transform = `scale(${zoomLevel}) translate(${imgTranslateX / zoomLevel}px, ${imgTranslateY / zoomLevel}px)`;
      }

      function zoomIn() {
        if (zoomLevel < zoomMax) {
          zoomLevel = Math.min(zoomMax, zoomLevel + zoomStep);
          clampTranslate();
          updateTransform();
        }
      }

      function zoomOut() {
        if (zoomLevel > zoomMin) {
          zoomLevel = Math.max(zoomMin, zoomLevel - zoomStep);
          clampTranslate();
          updateTransform();
        }
      }

      function zoomReset() {
        zoomLevel = 1;
        imgTranslateX = 0;
        imgTranslateY = 0;
        updateTransform();
      }

      // Clamp translate so image doesn't move out of bounds
      function clampTranslate() {
        const rect = lightboxImg.getBoundingClientRect();
        const containerRect = lightboxImg.parentElement.getBoundingClientRect();

        const maxTranslateX = (rect.width - containerRect.width) / 2;
        const maxTranslateY = (rect.height - containerRect.height) / 2;

        if (maxTranslateX > 0) {
          imgTranslateX = Math.min(maxTranslateX * zoomLevel, Math.max(-maxTranslateX * zoomLevel, imgTranslateX));
        } else {
          imgTranslateX = 0;
        }
        if (maxTranslateY > 0) {
          imgTranslateY = Math.min(maxTranslateY * zoomLevel, Math.max(-maxTranslateY * zoomLevel, imgTranslateY));
        } else {
          imgTranslateY = 0;
        }
      }

      // Mouse drag to pan
      lightboxImg.addEventListener("mousedown", (e) => {
        if (zoomLevel <= 1) return;
        isDragging = true;
        dragStartX = e.clientX - imgTranslateX;
        dragStartY = e.clientY - imgTranslateY;
        lightboxImg.style.cursor = "grabbing";
        e.preventDefault();
      });

      window.addEventListener("mouseup", () => {
        if (isDragging) {
          isDragging = false;
          lightboxImg.style.cursor = "grab";
        }
      });

      window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        imgTranslateX = e.clientX - dragStartX;
        imgTranslateY = e.clientY - dragStartY;
        clampTranslate();
        updateTransform();
      });

      // Touch events for pan and pinch zoom
      lightboxImg.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1 && zoomLevel > 1) {
          // Single finger pan start
          isDragging = true;
          dragStartX = e.touches[0].clientX - imgTranslateX;
          dragStartY = e.touches[0].clientY - imgTranslateY;
        } else if (e.touches.length === 2) {
          // Pinch start
          isDragging = false;
          initialDistance = getDistance(e.touches[0], e.touches[1]);
          initialZoom = zoomLevel;
          lastTouchMidpoint = getMidpoint(e.touches[0], e.touches[1]);
        }
      }, { passive: false });

      lightboxImg.addEventListener("touchmove", (e) => {
        if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
          e.preventDefault();
          imgTranslateX = e.touches[0].clientX - dragStartX;
          imgTranslateY = e.touches[0].clientY - dragStartY;
          clampTranslate();
          updateTransform();
        } else if (e.touches.length === 2) {
          e.preventDefault();
          const newDistance = getDistance(e.touches[0], e.touches[1]);
          const midpoint = getMidpoint(e.touches[0], e.touches[1]);
          if (initialDistance) {
            let scaleChange = newDistance / initialDistance;
            let newZoom = initialZoom * scaleChange;
            newZoom = Math.min(zoomMax, Math.max(zoomMin, newZoom));

            // Calculate translation to keep midpoint stable
            const rect = lightboxImg.getBoundingClientRect();
            const containerRect = lightboxImg.parentElement.getBoundingClientRect();

            // Coordinates relative to image center
            const offsetX = midpoint.clientX - rect.left - rect.width / 2;
            const offsetY = midpoint.clientY - rect.top - rect.height / 2;

            // Adjust translation based on zoom change
            imgTranslateX -= offsetX * (newZoom / zoomLevel - 1);
            imgTranslateY -= offsetY * (newZoom / zoomLevel - 1);

            zoomLevel = newZoom;
            clampTranslate();
            updateTransform();
          }
        }
      }, { passive: false });

      lightboxImg.addEventListener("touchend", (e) => {
        if (e.touches.length < 2) {
          initialDistance = null;
          lastTouchMidpoint = null;
        }
        if (e.touches.length === 0) {
          isDragging = false;
          lightboxImg.style.cursor = "grab";
        }
      });

      function getDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      }

      function getMidpoint(touch1, touch2) {
        return {
          clientX: (touch1.clientX + touch2.clientX) / 2,
          clientY: (touch1.clientY + touch2.clientY) / 2
        };
      }

      lightboxClose.addEventListener("click", closeLightbox);
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("active")) {
          closeLightbox();
        }
        if (lightbox.classList.contains("active")) {
          if (e.key === "ArrowLeft") {
            showPrevLightbox();
          }
          if (e.key === "ArrowRight") {
            showNextLightbox();
          }
          if (e.key === "+" || e.key === "=") {
            zoomIn();
          }
          if (e.key === "-") {
            zoomOut();
          }
          if (e.key === "0") {
            zoomReset();
          }
        }
      });

      lightboxPrev.addEventListener("click", () => {
        showPrevLightbox();
      });
      lightboxNext.addEventListener("click", () => {
        showNextLightbox();
      });
      zoomInBtn.addEventListener("click", zoomIn);
      zoomOutBtn.addEventListener("click", zoomOut);
      zoomResetBtn.addEventListener("click", zoomReset);
    })();
