import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements;

  loading = false;
  start = 0;
  end = 30;
  rowsCount = 30;

  onPointerdownSort = (event) => {
    const column = event.target.closest('[data-sortable="true"]')

    if (column) {
      const field = column.dataset.id;
      const currentOrder = column.dataset.order;
      const order = (currentOrder === 'desc') ? 'asc' : 'desc'

      this.sort(field, order)
    }
  }

  onScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect()

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.loading = true;
      this.setLoadingElement()

      this.end = this.end + this.rowsCount;

      const data = await this.loadData(this.sorted, this.start, this.end)
      this.update(data)

      this.loading = false;
      this.setLoadingElement()
    }
  }

  constructor(headersConfig, {
    data = [],
    sorted = null,
    isSortLocally = false,
    url = '',
  } = {}) {
    this.headersConfig = headersConfig,
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);
    this.data = data;

    if (!sorted) {
      this.sorted = {
        id: headersConfig.find(item => item.sortable).id,
        order: 'asc'
      };
    } else {
      this.sorted = sorted;
    }

    this.render()
  }

  async render() {
    this.element = this.getElement();
    this.subElements = this.getSubElements(this.element);

    if (this.data.length === 0) {
      this.loading = true;
      this.setLoadingElement()

      if (!this.isSortLocally) {
        const data = await this.loadData(this.sorted, this.start, this.end)
        this.update(data)
      } else {
        const data = await this.loadData(this.start, this.end)
        this.update(data)
        this.sortOnClient(this.sorted.id, this.sorted.order)
      }

      this.loading = false;
      this.setLoadingElement()
    }
    this.initListeners()
  }

  async update(data) {
    this.data = data;
    this.updateHeaderArrows()
    this.subElements.body.innerHTML = this.getBodyRow(this.data, this.headersConfig)
  }

  async loadData({
    id,
    order
  }, start, end) {
    if (!this.isSortLocally) {
      this.url.searchParams.set('_sort', id)
      this.url.searchParams.set('_order', order)
      this.url.searchParams.set('_start', start)
      this.url.searchParams.set('_end', end)
    }
    const data = await fetchJson(this.url)

    return data;
  }

  initListeners() {
    const header = this.subElements.header;
    header.addEventListener('pointerdown', this.onPointerdownSort)
    window.addEventListener("scroll", this.onScroll);
  }

  getElement() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    return element.firstElementChild;
  }

  getSubElements(element) {
    const result = {}
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement
    }

    return result
  }

  getTemplate() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeaderRow(this.headersConfig)}
        </div>

        <div data-element="body" class="sortable-table__body"></div>

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    `
  }

  getHeaderRow(headersConfig = []) {
    return `
      ${
        headersConfig
        .map((cell) => (
          `<div class="sortable-table__cell" data-id="${cell.id}" data-sortable="${cell.sortable}">
            <span>${cell.title}</span>
            ${this.setHeaderArrow(cell.sortable)}
          </div>`
        ))
        .join('')
      }
    `
  }

  setHeaderArrow(sortable) {
    return (
      (sortable) ?
      `<span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
        </span>` :
      ``
    )
  }

  updateHeaderArrows() {
    const fieldId = this.sorted.id;
    const order = this.sorted.order;

    const columns = this.element.querySelectorAll('.sortable-table__cell');
    columns.forEach((column) => column.dataset.order = '')

    const currentColumn = this.element.querySelector(`[data-id=${fieldId}]`)
    currentColumn.dataset.order = order;
  }

  getBodyRow(data = [], headersConfig = []) {
    return `
        ${    
          data
          .map((item) => (
            `<a href="/products/${item.id}" class="sortable-table__row">
              ${this.getBodyCell(item, headersConfig)}
            </a>`
          ))
          .join('')
        }
    `
  }

  getBodyCell(item = {}, headersConfig = []) {
    return headersConfig
      .map((cell) => (
        (cell.template) ?
        cell.template(item[cell.id]) :
        `<div class="sortable-table__cell">${item[cell.id]}</div>`
      ))
      .join('')
  }

  setLoadingElement() {
    if (this.loading) {
      this.subElements.loading.style.display = 'grid';
    } else {
      this.subElements.loading.style.display = 'none';
    }
  }

  sort(id, order) {
    this.sorted.id = id;
    this.sorted.order = order;

    if (this.isSortLocally) {
      this.sortOnClient(id, order)
    } else {
      this.sortOnServer(id, order)
    }
  }

  sortOnClient(id, order) {
    const data = [...this.data]
    const fieldColumn = this.headersConfig.find(column => column.id === id);
    const direction = (order === 'asc') ? 1 : -1

    const sortedData = data.sort((a, b) => {
      switch (fieldColumn.sortType) {
        case 'number':
          return direction * (a[id] - b[id])
        case 'string':
          return direction * a[id].localeCompare(b[id], ["ru", "en-US"])
      }
    })

    this.update(sortedData)
  }

  async sortOnServer(id, order) {
    const sorted = {
      id: id,
      order: order
    }
    const data = await this.loadData(sorted, this.start, this.end)
    this.update(data)
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove()
    this.element = null;
    window.removeEventListener("scroll", this.onScroll);
  }
}
