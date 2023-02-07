export default class SortableTable {
  element;
  subElements;
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render()
  }

  render() {
    this.element = this.getElement();
    this.subElements = this.getSubElements(this.element);
  }

  getElement() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    return element.firstElementChild;
  }

  getSubElements(element) {
    const result = {}
    result.body = element.querySelector('[data-element=body]')

    return result
  }

  getTemplate() {
    return `
      <div class="sortable-table">
        
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeaderRow(this.headerConfig)}
        </div>

        <div data-element="body" class="sortable-table__body">
          ${this.getBodyRow(this.data, this.headerConfig)}
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

  getHeaderRow(headerConfig = []) {
    return `
      ${
        headerConfig
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
      (sortable) 
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
        </span>` 
      : `` 
    )
  }

  getBodyRow(data = [], headerConfig = []) {
    return `
        ${    
          data
          .map((item) => (
            `<a href="/products/${item.id}" class="sortable-table__row">
              ${this.getBodyCell(item, headerConfig)}
            </a>`
          ))
          .join('')
        }
    `
  }

  getBodyCell(item = {}, headerConfig = []) {
    return headerConfig
      .map((cell) => (
        (cell.id === 'images')
        ?`<div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${item.images[0].url}">
          </div>`
        :`<div class="sortable-table__cell">${item[cell.id]}</div>`
      ))
      .join('')
  }

  sort(field, order) {
    this.updateHeaderArrows(field, order)

    const fieldColumn = this.headerConfig.find(column => column.id === field);
    const sortedData = this.sortData(fieldColumn, order);

    this.subElements.body.innerHTML = this.getBodyRow(sortedData, this.headerConfig)
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
    const columns = document.querySelectorAll('.sortable-table__cell');
    columns.forEach((column) => column.dataset.order = '')

    const currentColumn = document.querySelector(`[data-id=${field}]`)
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