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
        lightboxImg.style.transform = `scale(${zoomLevel})`;
        updateLightboxNavButtons();
      }

      function closeLightbox() {
        lightbox.classList.remove("active");
        lightboxImg.src = "";
        lightboxCaption.textContent = "";
        zoomLevel = 1;
        lightboxImg.style.transform = `scale(1)`;
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
          updateLightbox();
        }
      }

      function showNextLightbox() {
        if (lightboxIndex < data.length - 1) {
          lightboxIndex++;
          zoomLevel = 1;
          updateLightbox();
        }
      }

      function zoomIn() {
        if (zoomLevel < zoomMax) {
          zoomLevel = Math.min(zoomMax, zoomLevel + zoomStep);
          lightboxImg.style.transform = `scale(${zoomLevel})`;
        }
      }

      function zoomOut() {
        if (zoomLevel > zoomMin) {
          zoomLevel = Math.max(zoomMin, zoomLevel - zoomStep);
          lightboxImg.style.transform = `scale(${zoomLevel})`;
        }
      }

      function zoomReset() {
        zoomLevel = 1;
        lightboxImg.style.transform = `scale(1)`;
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

      // Optional: Drag to pan when zoomed in
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let imgTranslateX = 0;
      let imgTranslateY = 0;

      lightboxImg.style.cursor = "grab";

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
        lightboxImg.style.transform = `scale(${zoomLevel}) translate(${imgTranslateX / zoomLevel}px, ${imgTranslateY / zoomLevel}px)`;
      });

      // Reset pan on zoom reset or image change
      function resetPan() {
        imgTranslateX = 0;
        imgTranslateY = 0;
        lightboxImg.style.transform = `scale(${zoomLevel}) translate(0, 0)`;
      }

      // Override zoomIn, zoomOut, zoomReset, updateLightbox to reset pan
      function zoomIn() {
        if (zoomLevel < zoomMax) {
          zoomLevel = Math.min(zoomMax, zoomLevel + zoomStep);
          resetPan();
        }
      }

      function zoomOut() {
        if (zoomLevel > zoomMin) {
          zoomLevel = Math.max(zoomMin, zoomLevel - zoomStep);
          resetPan();
        }
      }

      function zoomReset() {
        zoomLevel = 1;
        resetPan();
      }

      function updateLightbox() {
        const item = data[lightboxIndex];
        lightboxImg.src = item.imgSrc;
        lightboxImg.alt = item.imgAlt;
        lightboxCaption.textContent = item.title;
        resetPan();
        updateLightboxNavButtons();
      }
    })();
