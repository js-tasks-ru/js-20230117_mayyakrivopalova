export default class SortableTable {
  element;
  subElements;

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;

    this.render()
    this.initListeners()
  }

  render() {
    this.element = this.getElement();
    this.subElements = this.getSubElements(this.element);

    if (this.sorted) {
      const field = this.sorted.id;
      const order = this.sorted.order;

      this.sort(field, order)
    }
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

        <div data-element="body" class="sortable-table__body">
          ${this.getBodyRow(this.data, this.headersConfig)}
        </div>

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

  initListeners() {
    const headerCells = this.subElements.header.children;

    for (const element of headerCells) {
      const sortable = JSON.parse(element.dataset.sortable)

      if (sortable) {
        element.addEventListener('pointerdown', () => this.onPointerdownSort(element))
      }
    }
  }

  onPointerdownSort(element) {
    const field = element.dataset.id
    const currentOrder = element.dataset.order;

    const order = (currentOrder === 'desc') ? 'asc' : 'desc'

    this.sort(field, order)
  }

  sort(field, order) {
    this.updateHeaderArrows(field, order)

    const fieldColumn = this.headersConfig.find(column => column.id === field);
    const sortedData = this.sortData(fieldColumn, order);

    this.subElements.body.innerHTML = this.getBodyRow(sortedData, this.headersConfig)
  }

  sortData(fieldColumn, order) {
    const data = [...this.data]
    const fieldID = fieldColumn.id
    const direction = (order === 'asc') ? 1 : -1

    return data.sort((a, b) => {
      switch (fieldColumn.sortType) {
        case 'number':
          return direction * (a[fieldID] - b[fieldID])
        case 'string':
          return direction * a[fieldID].localeCompare(b[fieldID], ["ru", "en-US"])
      }
    })
  }

  updateHeaderArrows(field, order) {
    const columns = this.element.querySelectorAll('.sortable-table__cell');
    columns.forEach((column) => column.dataset.order = '')

    const currentColumn = this.element.querySelector(`[data-id=${field}]`)
    currentColumn.dataset.order = order;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove()
    this.element = null;
  }
}
