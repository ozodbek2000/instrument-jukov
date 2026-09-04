const fs = require('fs');
const path = require('path');

const prods = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/data/products.json'), 'utf-8'));

function escapeAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Build product cards
const productCardsHtml = prods.map(p => {
  const catClasses = p.categories.join(' ');
  const title = p.shortName || p.name;
  return `            <!-- Товар ${p.sku} -->
            <article class="product-card" data-category="${catClasses}" data-price="${p.price}" data-name="${escapeAttr(p.name.toLowerCase())}" data-sku="${escapeAttr(p.sku.toLowerCase())}">
              <a href="/product.html?sku=${encodeURIComponent(p.sku)}" class="product-card__image-box" aria-label="${escapeAttr(p.name)}">
                <img src="${p.image}" alt="${escapeAttr(p.name)}" class="product-card__image" loading="lazy">
              </a>
              <div class="product-card__body">
                <span class="product-card__category">${p.categoryName} • ${p.brand}</span>
                <h3 class="product-card__title">
                  <a href="/product.html?sku=${encodeURIComponent(p.sku)}">${title}</a>
                </h3>
                <p class="product-card__specs-short">${p.specsShort}</p>
                <div class="product-card__footer">
                  <div class="product-card__price-box">
                    <span class="product-card__price">${p.price.toLocaleString('ru-RU')} ₽</span>
                    <span class="product-card__price-sub">Прокат: от ${p.rentPrice} ₽/сут</span>
                  </div>
                  <a href="/product.html?sku=${encodeURIComponent(p.sku)}" class="btn btn-outline btn-sm">Подробнее</a>
                </div>
              </div>
            </article>`;
}).join('\n\n');

// Read existing catalog.html
let catalogHtml = fs.readFileSync(path.join(__dirname, '../catalog.html'), 'utf-8');

// Build the clean main content
const mainContentHtml = `  <main>
    <!-- Заголовок страницы и хлебные крошки -->
    <section class="page-header">
      <div class="container">
        <div class="breadcrumbs">
          <a href="/">Главная</a>
          <span class="breadcrumbs__separator">/</span>
          <span>Каталог</span>
        </div>
        <h1 class="page-title">Каталог инструмента и оборудования</h1>
      </div>
    </section>

    <!-- Основной контент каталога -->
    <div class="container">
      <!-- Мобильные быстрые фильтры по категориям (горизонтальный скролл) -->
      <div class="catalog-mobile-chips" id="catalogMobileChips">
        <button type="button" class="catalog-chip active" data-category="all">Все (45)</button>
        <button type="button" class="catalog-chip" data-category="drills">Дрели и шуруповерты (15)</button>
        <button type="button" class="catalog-chip" data-category="rotary">Перфораторы и отбойники (7)</button>
        <button type="button" class="catalog-chip" data-category="grinders">Шлифмашины и УШМ (9)</button>
        <button type="button" class="catalog-chip" data-category="saws">Пилы и распиловка (8)</button>
        <button type="button" class="catalog-chip" data-category="multi">МФИ, рубанки, фрезеры (5)</button>
        <button type="button" class="catalog-chip" data-category="garden">Садовая техника (2)</button>
        <button type="button" class="catalog-chip" data-category="heavy">Тяжелое оборудование (2)</button>
      </div>

      <div class="catalog-layout">
        <!-- Сайдбар категорий слева -->
        <aside class="catalog-sidebar">
          <div class="catalog-filter-card">
            <h2 class="catalog-filter-card__title">Категории</h2>
            <ul class="catalog-category-list">
              <li class="catalog-category-item active">
                <a href="#all" data-category="all">
                  <span>Все категории</span>
                  <span class="catalog-category-count">45</span>
                </a>
              </li>
              <li class="catalog-category-item">
                <a href="#drills" data-category="drills">
                  <span>Дрели и шуруповерты</span>
                  <span class="catalog-category-count">15</span>
                </a>
              </li>
              <li class="catalog-category-item">
                <a href="#rotary" data-category="rotary">
                  <span>Перфораторы и отбойники</span>
                  <span class="catalog-category-count">7</span>
                </a>
              </li>
              <li class="catalog-category-item">
                <a href="#grinders" data-category="grinders">
                  <span>Шлифмашины и УШМ</span>
                  <span class="catalog-category-count">9</span>
                </a>
              </li>
              <li class="catalog-category-item">
                <a href="#saws" data-category="saws">
                  <span>Пилы и распиловка</span>
                  <span class="catalog-category-count">8</span>
                </a>
              </li>
              <li class="catalog-category-item">
                <a href="#multi" data-category="multi">
                  <span>МФИ, рубанки, фрезеры</span>
                  <span class="catalog-category-count">5</span>
                </a>
              </li>
              <li class="catalog-category-item">
                <a href="#garden" data-category="garden">
                  <span>Садовая техника</span>
                  <span class="catalog-category-count">2</span>
                </a>
              </li>
              <li class="catalog-category-item">
                <a href="#heavy" data-category="heavy">
                  <span>Тяжелое оборудование</span>
                  <span class="catalog-category-count">2</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="catalog-filter-card" style="margin-top: 20px;">
            <h2 class="catalog-filter-card__title">Бренд</h2>
            <div style="padding: 6px 0; font-size: 0.9375rem; display: flex; align-items: center; justify-content: space-between; color: var(--color-text);">
              <span style="font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                DCK Professional
              </span>
              <span class="catalog-category-count" style="margin-left: 8px;">45</span>
            </div>
            <div style="font-size: 0.8125rem; color: var(--color-text-muted); margin-top: 8px; line-height: 1.4;">
              Официальная гарантия до 3 лет, авторизованный сервис и склад оригинальных запчастей в Омске на Жукова, 6.
            </div>
          </div>
        </aside>

        <!-- Сетка товаров и панель управления справа -->
        <div class="catalog-content">
          <div class="catalog-toolbar">
            <div class="catalog-counter" id="catalogCounter">Загрузка каталога...</div>
            <div class="catalog-controls-wrap">
              <div class="catalog-search-wrap">
                <input type="text" id="catalogSearchInput" placeholder="Поиск по модели, названию или артикулу..." class="form-control catalog-search-input">
                <svg class="catalog-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <button type="button" id="clearSearchBtn" class="catalog-search-clear" aria-label="Очистить поиск" style="display: none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <select id="catalogSortSelect" class="form-control catalog-sort-select">
                <option value="default">Сортировка: По умолчанию</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="price-desc">Сначала дороже</option>
                <option value="name-asc">По наименованию (А–Я)</option>
              </select>
            </div>
          </div>

          <!-- Сетка товаров -->
          <div class="products-grid" id="catalogProductsGrid">
${productCardsHtml}
          </div>

          <!-- Сообщение если ничего не найдено -->
          <div id="catalogNoResults" style="display: none; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: 12px; border: 1px dashed var(--color-border); margin-top: 24px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">По вашему запросу ничего не найдено</h3>
            <p style="color: var(--color-text-muted); max-width: 420px; margin: 0 auto 20px;">Попробуйте изменить формулировку, проверить артикул или сбросить фильтры.</p>
            <button type="button" class="btn btn-outline btn-sm" id="resetCatalogFiltersBtn">Сбросить фильтры</button>
          </div>

          <!-- Интерактивная пагинация -->
          <div class="pagination" id="catalogPagination"></div>
        </div>
      </div>
    </div>

    <!-- Блок онлайн-консультации и подбора инструмента -->
    <section class="feedback-section" id="feedback" style="margin-top: 40px;">
      <div class="container">
        <div class="feedback-grid">
          <div class="feedback-content">
            <h2 class="feedback-content__title">Нужна консультация по инструменту?</h2>
            <p class="feedback-content__text">
              Оставьте заявку, и наш специалист свяжется с вами в течение 10 минут, чтобы ответить на все вопросы, подобрать оснастку или забронировать оборудование в аренду.
            </p>
            <div class="feedback-points">
              <div class="feedback-point">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Бесплатный профессиональный подбор инструмента DCK</span>
              </div>
              <div class="feedback-point">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Бронирование техники в прокате без очередей</span>
              </div>
              <div class="feedback-point">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Гарантия, наличие оснастки и сервис в Омске на Жукова, 6</span>
              </div>
            </div>
          </div>

          <div class="feedback-form-card">
            <h3 class="form-box__title">Подобрать инструмент</h3>
            <p class="form-box__subtitle">Заполните форму, и мы перезвоним вам в ближайшее время</p>

            <form id="catalogFeedbackForm" action="#" method="POST">
              <div class="form-group">
                <label for="catalogFeedbackName" class="form-label">Ваше имя *</label>
                <input type="text" id="catalogFeedbackName" name="name" class="form-control" placeholder="Иван Петров" required>
              </div>

              <div class="form-group">
                <label for="catalogFeedbackPhone" class="form-label">Телефон *</label>
                <input type="tel" id="catalogFeedbackPhone" name="phone" class="form-control" placeholder="+7 (___) ___-__-__" required>
              </div>

              <div class="form-group">
                <label for="catalogFeedbackComment" class="form-label">Какой инструмент вас интересует?</label>
                <textarea id="catalogFeedbackComment" name="comment" class="form-control" rows="3" placeholder="Например, перфоратор SDS-Max или шуруповерт..."></textarea>
              </div>

              <button type="submit" class="btn btn-primary btn-block btn-lg" id="submitCatalogFeedbackBtn">
                Отправить заявку
              </button>

              <p class="form-box__agreement">
                Нажимая кнопку, вы соглашаетесь на обработку персональных данных
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  </main>`;

// Replace <main>...</main> cleanly in catalogHtml
const mainRegex = /<main>[\s\S]*?<\/main>/;
catalogHtml = catalogHtml.replace(mainRegex, mainContentHtml);

// Ensure scripts have type="module"
catalogHtml = catalogHtml.replace(/<script src="\/assets\/js\/products-data\.js"><\/script>/g, '<script type="module" src="/assets/js/products-data.js"></script>');
catalogHtml = catalogHtml.replace(/<script src="\/assets\/js\/script\.js"><\/script>/g, '<script type="module" src="/assets/js/script.js"></script>');

fs.writeFileSync(path.join(__dirname, '../catalog.html'), catalogHtml, 'utf-8');
console.log('Successfully generated clean, balanced catalog.html with 45 products, mobile chips, dynamic pagination, and feedback section!');
