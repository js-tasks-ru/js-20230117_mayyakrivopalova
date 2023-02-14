import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  element;

  constructor({
    url = '',
    range = {},
    label = '',
    link = '',
    value = 0,
    formatHeading = data => data
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);
    this.formatHeading = formatHeading;
    this.data = {};

    this.render()
    this.update(range.from, range.to) 
  }

  render() {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
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

  removeLoadingSkeleton() {
    if (Object.keys(this.data).length !== 0 && this.element.classList.contains('column-chart_loading')) {
      this.element.classList.remove('column-chart_loading');
    } 
  }

  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title" bis_skin_checked="1">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container" bis_skin_checked="1">
          <div data-element="header" class="column-chart__header" bis_skin_checked="1">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart" bis_skin_checked="1">
            ${this.getChartColumns(this.data)}
          </div>
        </div>
      </div>
    `
  }

  getLink() {
    return (
      (this.link) 
      ?`<a class="column-chart__link" href="${this.link}">View all</a>` 
      :''
    )
  }

  getValue(data) {
   return Object.values(data).reduce((sum, value) => sum + value, 0)
  }

  getChartColumns(dataColumns) {
    const dataArr = Object.values(dataColumns)

    const maxValue = Math.max(...dataArr);
    const ratio = this.chartHeight / maxValue;

    return (
      dataArr.map((columnValue) => (
        `<div 
          style="--value: ${Math.floor(columnValue * ratio)}" 
          data-tooltip=${(columnValue / maxValue * 100).toFixed(0) + '%'} 
          bis_skin_checked="1">
        </div>`
      ))
      .join('')
    )
  }

  async update(from, to) {
    await this.loadData(from, to)

    this.value = this.getValue(this.data)
    this.subElements.header.innerHTML = this.formatHeading(this.value)
    this.subElements.body.innerHTML = this.getChartColumns(this.data)
    this.removeLoadingSkeleton()

    return this.data
  }

  async loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString())
    this.url.searchParams.set('to', to.toISOString())

    const data = await fetchJson(this.url);
    this.data = data;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
