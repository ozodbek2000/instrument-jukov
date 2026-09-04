/**
 * ИНСТРУМЕНТ НА ЖУКОВА — Основной JavaScript
 * Поддержка каталога 45 товаров DCK, динамической страницы товара, фильтрации, поиска и сортировки
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. МОБИЛЬНОЕ МЕНЮ (БУРГЕР)
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('active');
      burgerBtn.classList.toggle('active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        burgerBtn.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // 2. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ С УЧЕТОМ ВЫСОТЫ ШАПКИ
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId.length <= 1) return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 3. ПОДСВЕТКА АКТИВНЫХ ПУНКТОВ МЕНЮ ПРИ СКРОЛЛЕ
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

  function highlightNavOnScroll() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  if (sections.length && navLinks.length) {
    window.addEventListener('scroll', highlightNavOnScroll, { passive: true });
  }

  // 4. ДИНАМИЧЕСКАЯ СТРАНИЦА ТОВАРА (PRODUCT.HTML)
  initProductPage();

  // 5. КАТАЛОГ: ФИЛЬТРАЦИЯ, ЖИВОЙ ПОИСК, СОРТИРОВКА (CATALOG.HTML)
  initCatalogPage();

  // 6. ОБРАБОТКА ВСЕХ ФОРМ ЗАЯВОК (БЕЗ ПЕРЕЗАГРУЗКИ СТРАНИЦЫ)
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameField = form.querySelector('[name="name"]');
      const phoneField = form.querySelector('[name="phone"]');

      if (nameField && !nameField.value.trim()) {
        nameField.focus();
        showToast('Пожалуйста, укажите ваше имя', true);
        return;
      }

      if (phoneField && !phoneField.value.trim()) {
        phoneField.focus();
        showToast('Пожалуйста, укажите контактный телефон', true);
        return;
      }

      // Успешная отправка
      showToast('Спасибо за заявку! Наш специалист свяжется с вами в течение 10 минут.');
      form.reset();
    });
  });

  // 7. УНИВЕРСАЛЬНЫЙ ТОСТ УВЕДОМЛЕНИЙ
  function showToast(message, isError = false) {
    let toast = document.getElementById('siteToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'siteToast';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }

    toast.style.backgroundColor = isError ? '#991B1B' : '#065F46';
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        ${isError 
          ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' 
          : '<polyline points="20 6 9 17 4 12"></polyline>'}
      </svg>
      <span>${message}</span>
    `;

    toast.classList.add('active');

    setTimeout(() => {
      toast.classList.remove('active');
    }, 4500);
  }

  // --- ФУНКЦИЯ ДЛЯ СТРАНИЦЫ ТОВАРА (PRODUCT.HTML) ---
  function initProductPage() {
    const mainProductImg = document.getElementById('mainProductImg');
    if (!mainProductImg) return; // Не страница товара

    const products = window.PRODUCTS_DATA || [];
    if (!products.length) return;

    const urlParams = new URLSearchParams(window.location.search);
    const skuParam = urlParams.get('sku');

    let current = null;
    if (skuParam) {
      current = products.find(p => p.sku.toLowerCase() === skuParam.toLowerCase())
        || products.find(p => p.sku.toLowerCase().includes(skuParam.toLowerCase()))
        || products.find(p => skuParam.toLowerCase().includes(p.sku.toLowerCase()));
    }

    if (!current) {
      current = products[0]; // По умолчанию первый товар из импортированных
    }

    // Обновляем title страницы
    document.title = `${current.name} — купить в Омске | Инструмент на Жукова`;

    // Обновляем хлебные крошки
    const breadcrumbs = document.querySelector('.breadcrumbs');
    if (breadcrumbs) {
      breadcrumbs.innerHTML = `
        <a href="index.html">Главная</a>
        <span class="breadcrumbs__separator">/</span>
        <a href="catalog.html">Каталог</a>
        <span class="breadcrumbs__separator">/</span>
        <a href="catalog.html#${current.categoryFilter}">${current.subCategory}</a>
        <span class="breadcrumbs__separator">/</span>
        <span>${current.shortName || current.name}</span>
      `;
    }

    // Главное фото товара
    mainProductImg.src = current.image;
    mainProductImg.alt = current.name;

    // Миниатюры в галерее
    const thumbsContainer = document.querySelector('.product-gallery__thumbs');
    if (thumbsContainer) {
      thumbsContainer.innerHTML = `
        <div class="product-gallery__thumb active" data-img="${current.image}">
          <img src="${current.image}" alt="${current.name}">
        </div>
      `;

      // Добавим клик для переключения
      const allThumbs = thumbsContainer.querySelectorAll('.product-gallery__thumb');
      allThumbs.forEach(thumb => {
        thumb.addEventListener('click', function () {
          allThumbs.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          const newSrc = this.getAttribute('data-img');
          if (newSrc) mainProductImg.src = newSrc;
        });
      });
    }

    // Заголовок товара
    const productTitle = document.querySelector('.product-info__title');
    if (productTitle) {
      productTitle.textContent = current.name;
    }

    // Категория и артикул
    const productCategory = document.querySelector('.product-info__category');
    if (productCategory) {
      productCategory.textContent = `Категория: ${current.categoryName} / ${current.subCategory} • Артикул: ${current.sku}`;
    }

    // Цены (продажа и прокат)
    const priceVal = document.querySelector('.product-info__price-value');
    if (priceVal) {
      priceVal.textContent = `${current.price.toLocaleString('ru-RU')} ₽`;
    }

    const priceRent = document.querySelector('.product-info__price-rent');
    if (priceRent) {
      const deposit = Math.round(current.price * 0.25).toLocaleString('ru-RU');
      priceRent.textContent = `Аренда: от ${current.rentPrice} ₽ / сутки (залог ${deposit} ₽)`;
    }

    // Краткое описание
    const shortDesc = document.querySelector('.product-info__short-desc');
    if (shortDesc) {
      shortDesc.textContent = current.shortDesc;
    }

    // Таблица характеристик
    const specsTbody = document.querySelector('.specs-table tbody');
    if (specsTbody && current.specs && current.specs.length) {
      specsTbody.innerHTML = current.specs.map(spec => `
        <tr>
          <td>${spec.name}</td>
          <td>${spec.value}</td>
        </tr>
      `).join('');
    }

    // Блок описания
    const descContainers = document.querySelectorAll('.product-tabs-section > div');
    if (descContainers.length >= 2) {
      const descBlock = descContainers[1].querySelector('div');
      if (descBlock) {
        let featuresHtml = '';
        if (current.features && current.features.length) {
          featuresHtml = `
            <h4 style="font-size: 1.05rem; font-weight: 700; margin: 18px 0 10px; color: var(--color-text);">Преимущества и особенности модели:</h4>
            <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 18px; line-height: 1.6;">
              ${current.features.map(f => `<li style="margin-bottom: 6px;">${f}</li>`).join('')}
            </ul>
          `;
        }

        let packageHtml = '';
        if (current.packageContents && current.packageContents.length) {
          packageHtml = `
            <h4 style="font-size: 1.05rem; font-weight: 700; margin: 18px 0 10px; color: var(--color-text);">Комплектация:</h4>
            <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 18px; line-height: 1.6;">
              ${current.packageContents.map(p => `<li style="margin-bottom: 6px;">${p}</li>`).join('')}
            </ul>
          `;
        }

        descBlock.innerHTML = `
          <p style="margin-bottom: 14px; font-size: 1.05rem; line-height: 1.7;">${current.shortDesc}</p>
          ${featuresHtml}
          ${packageHtml}
          <div style="margin-top: 20px; padding: 16px 20px; background: #f8fafc; border-radius: 8px; border: 1px solid var(--color-border); font-size: 0.9375rem; color: var(--color-text-muted);">
            <strong style="color: var(--color-text);">Гарантия и сервис в Омске:</strong> официальный сервисный центр на ул. М. Жукова, 6. Обеспечиваем предпродажную проверку, наличие оригинальных запчастей и расходных материалов.
          </div>
        `;
      }
    }

    // Заявка на товар
    const orderSectionTitle = document.querySelector('.product-order-info__title');
    if (orderSectionTitle) {
      orderSectionTitle.textContent = `Заявка на ${current.shortName || current.sku}`;
    }

    const orderSectionDesc = document.querySelector('.product-order-info__desc');
    if (orderSectionDesc) {
      orderSectionDesc.textContent = `Заполните форму, чтобы купить ${current.name}, забронировать его в аренду или уточнить наличие оснастки и расходных материалов в магазине на Жукова, 6.`;
    }

    const hiddenProductInput = document.querySelector('input[name="product"]');
    if (hiddenProductInput) {
      hiddenProductInput.value = `${current.name} (Артикул: ${current.sku})`;
    }

    // Кнопка скролла к заявке
    const productOrderBtn = document.getElementById('productOrderBtn');
    const productOrderSection = document.getElementById('productOrderSection');
    const orderNameInput = document.getElementById('orderNameInput');

    if (productOrderBtn && productOrderSection) {
      productOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const headerOffset = 90;
        const elementPosition = productOrderSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        if (orderNameInput) {
          setTimeout(() => {
            orderNameInput.focus();
          }, 600);
        }
      });
    }

    // Похожие товары (рекомендуемые из каталога)
    const similarGrid = document.querySelector('.product-tabs-section + div .products-grid')
      || document.querySelector('#productOrderSection + div .products-grid');

    if (similarGrid) {
      const otherProducts = products.filter(p => p.sku !== current.sku);
      // Сначала той же подкатегории, затем остальные
      const sameCategory = otherProducts.filter(p => p.subCategory === current.subCategory);
      const differentCategory = otherProducts.filter(p => p.subCategory !== current.subCategory);
      const recommended = [...sameCategory, ...differentCategory].slice(0, 4);

      similarGrid.innerHTML = recommended.map(p => `
        <article class="product-card">
          <div class="product-card__image-box">
            <img src="${p.image}" alt="${p.name}" class="product-card__image" loading="lazy">
          </div>
          <div class="product-card__body">
            <span class="product-card__category">${p.categoryName} • ${p.brand}</span>
            <h3 class="product-card__title">
              <a href="product.html?sku=${encodeURIComponent(p.sku)}">${p.shortName || p.name}</a>
            </h3>
            <p class="product-card__specs-short">${p.specsShort}</p>
            <div class="product-card__footer">
              <div class="product-card__price-box">
                <span class="product-card__price">${p.price.toLocaleString('ru-RU')} ₽</span>
                <span class="product-card__price-sub">Прокат: от ${p.rentPrice} ₽/сут</span>
              </div>
              <a href="product.html?sku=${encodeURIComponent(p.sku)}" class="btn btn-outline btn-sm">Подробнее</a>
            </div>
          </div>
        </article>
      `).join('');
    }
  }

  // --- ФУНКЦИЯ ДЛЯ КАТАЛОГА (CATALOG.HTML) ---
  function initCatalogPage() {
    const grid = document.getElementById('catalogProductsGrid');
    if (!grid) return; // Не страница каталога

    const categoryFilters = document.querySelectorAll('.catalog-category-item a');
    const mobileChips = document.querySelectorAll('.catalog-chip');
    const searchInput = document.getElementById('catalogSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const sortSelect = document.getElementById('catalogSortSelect');
    const counterEl = document.getElementById('catalogCounter');
    const noResultsEl = document.getElementById('catalogNoResults');
    const resetFiltersBtn = document.getElementById('resetCatalogFiltersBtn');
    const paginationEl = document.getElementById('catalogPagination');
    const toolbarEl = document.querySelector('.catalog-toolbar');

    const ITEMS_PER_PAGE = 12;
    let currentCategory = 'all';
    let searchQuery = '';
    let sortMode = 'default';
    let currentPage = 1;

    // Проверяем hash в URL (например catalog.html#rotary)
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const matchCategory = Array.from(categoryFilters).some(a => a.getAttribute('data-category') === hash);
      if (matchCategory) {
        currentCategory = hash;
      }
    }

    function updateActiveCategoryUI(cat) {
      categoryFilters.forEach(filter => {
        const isMatch = (filter.getAttribute('data-category') || 'all') === cat;
        filter.parentElement?.classList.toggle('active', isMatch);
      });

      mobileChips.forEach(chip => {
        const isMatch = (chip.getAttribute('data-category') || 'all') === cat;
        chip.classList.toggle('active', isMatch);
      });
    }

    function applyFiltersAndSort(resetPage = false) {
      if (resetPage) {
        currentPage = 1;
      }

      const cards = Array.from(grid.querySelectorAll('.product-card'));

      // 1. Фильтрация
      const matchingCards = [];
      cards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        const name = (card.getAttribute('data-name') || '').toLowerCase();
        const sku = (card.getAttribute('data-sku') || '').toLowerCase();
        const specs = (card.querySelector('.product-card__specs-short')?.textContent || '').toLowerCase();

        const matchCategory = currentCategory === 'all' || categories.includes(currentCategory);
        const matchSearch = !searchQuery || name.includes(searchQuery) || sku.includes(searchQuery) || specs.includes(searchQuery);

        if (matchCategory && matchSearch) {
          matchingCards.push(card);
        } else {
          card.style.display = 'none';
        }
      });

      // 2. Сортировка подходящих карточек
      if (sortMode !== 'default') {
        matchingCards.sort((a, b) => {
          const priceA = parseFloat(a.getAttribute('data-price')) || 0;
          const priceB = parseFloat(b.getAttribute('data-price')) || 0;
          const nameA = a.getAttribute('data-name') || '';
          const nameB = b.getAttribute('data-name') || '';

          if (sortMode === 'price-asc') return priceA - priceB;
          if (sortMode === 'price-desc') return priceB - priceA;
          if (sortMode === 'name-asc') return nameA.localeCompare(nameB, 'ru');
          return 0;
        });

        // Переупорядочиваем в DOM
        matchingCards.forEach(card => grid.appendChild(card));
      }

      const totalMatching = matchingCards.length;
      const totalPages = Math.max(1, Math.ceil(totalMatching / ITEMS_PER_PAGE));

      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      // 3. Отображение только текущей страницы
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;

      matchingCards.forEach((card, index) => {
        if (index >= startIndex && index < endIndex) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });

      // 4. Обновление счетчика товаров
      if (counterEl) {
        if (totalMatching === 0) {
          counterEl.textContent = 'Товары не найдены';
        } else if (totalMatching <= ITEMS_PER_PAGE) {
          counterEl.textContent = `Показано ${totalMatching} ${declOfNum(totalMatching, ['товар', 'товара', 'товаров'])}`;
        } else {
          const displayStart = startIndex + 1;
          const displayEnd = Math.min(endIndex, totalMatching);
          counterEl.textContent = `Показано ${displayStart}–${displayEnd} из ${totalMatching} ${declOfNum(totalMatching, ['товара', 'товаров', 'товаров'])}`;
        }
      }

      // 5. Блок "Ничего не найдено"
      if (noResultsEl) {
        noResultsEl.style.display = totalMatching === 0 ? 'block' : 'none';
      }

      // 6. Отрисовка пагинации
      renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
      if (!paginationEl) return;

      if (totalPages <= 1) {
        paginationEl.style.display = 'none';
        paginationEl.innerHTML = '';
        return;
      }

      paginationEl.style.display = 'flex';
      let html = '';

      // Кнопка "Назад"
      const prevDisabled = currentPage === 1 ? ' disabled' : '';
      html += `
        <button type="button" class="pagination__item${prevDisabled}" data-page="${currentPage - 1}" aria-label="Предыдущая страница">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      `;

      // Номера страниц
      for (let p = 1; p <= totalPages; p++) {
        const activeClass = p === currentPage ? ' active' : '';
        html += `<button type="button" class="pagination__item${activeClass}" data-page="${p}">${p}</button>`;
      }

      // Кнопка "Вперед"
      const nextDisabled = currentPage === totalPages ? ' disabled' : '';
      html += `
        <button type="button" class="pagination__item${nextDisabled}" data-page="${currentPage + 1}" aria-label="Следующая страница">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      `;

      paginationEl.innerHTML = html;

      // Навешиваем слушатели на кнопки пагинации
      paginationEl.querySelectorAll('.pagination__item:not(.disabled):not(.active)').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetPage = parseInt(btn.getAttribute('data-page'), 10);
          if (targetPage && targetPage !== currentPage) {
            currentPage = targetPage;
            applyFiltersAndSort(false);

            if (toolbarEl) {
              const headerOffset = 90;
              const elementPosition = toolbarEl.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }
        });
      });
    }

    function declOfNum(n, titles) {
      return titles[(n % 100 > 4 && n % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(n % 10 < 5) ? Math.min(n % 10, 5) : 5]];
    }

    // Слушатели десктопных категорий
    categoryFilters.forEach(filter => {
      filter.addEventListener('click', function (e) {
        e.preventDefault();
        const cat = this.getAttribute('data-category') || 'all';
        currentCategory = cat;
        updateActiveCategoryUI(cat);
        window.history.replaceState(null, null, `#${cat}`);
        applyFiltersAndSort(true);
      });
    });

    // Слушатели мобильных чипсов
    mobileChips.forEach(chip => {
      chip.addEventListener('click', function () {
        const cat = this.getAttribute('data-category') || 'all';
        currentCategory = cat;
        updateActiveCategoryUI(cat);
        window.history.replaceState(null, null, `#${cat}`);
        applyFiltersAndSort(true);
      });
    });

    // Слушатель поиска
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchQuery.length > 0 ? 'flex' : 'none';
        }
        applyFiltersAndSort(true);
      });
    }

    // Очистка поиска
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchQuery = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        clearSearchBtn.style.display = 'none';
        applyFiltersAndSort(true);
      });
    }

    // Слушатель сортировки
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortMode = e.target.value;
        applyFiltersAndSort(true);
      });
    }

    // Кнопка сброса всех фильтров
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        currentCategory = 'all';
        searchQuery = '';
        sortMode = 'default';
        currentPage = 1;
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        if (sortSelect) sortSelect.value = 'default';
        updateActiveCategoryUI('all');
        window.history.replaceState(null, null, window.location.pathname);
        applyFiltersAndSort(true);
      });
    }

    // Первоначальный запуск
    updateActiveCategoryUI(currentCategory);
    applyFiltersAndSort(false);
  }
});
