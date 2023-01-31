export default class ColumnChart {
  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = null,
  } = {}) {
    this._element = null;
    this.chartHeight = 50;

    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;

    this.render()
  }

  get element() {
    return this._element;
  }

  render() {
    this._element = document.createElement('div')
    this._element.style = `--chart-height: ${this.chartHeight}`
    this._element.classList.add('column-chart')

    if (!this.data.length) {
      this._element.classList.add('column-chart_loading');
    }

    this._element.innerHTML = this.getContent();
  }

  getContent() {
    return `
      <div class="column-chart__title" bis_skin_checked="1">
        Total ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container" bis_skin_checked="1">
        <div data-element="header" class="column-chart__header" bis_skin_checked="1">
          ${ (this.formatHeading) ? this.formatHeading(this.value) : this.value }
        </div>
        <div data-element="body" class="column-chart__chart" bis_skin_checked="1">
          ${this.getChartColumns(this.data)}
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

  getChartColumns(dataColumns) {
    const maxValue = Math.max(...dataColumns);
    const ratio = this.chartHeight / maxValue;

    return (
      dataColumns.map((columnValue) => (
        `<div 
          style="--value: ${Math.floor(columnValue * ratio)}" 
          data-tooltip=${(columnValue / maxValue * 100).toFixed(0) + '%'} 
          bis_skin_checked="1">
        </div>`
      ))
      .join('')
    )
  }

  destroy() {
    this.remove();
  }

  remove() {
    this._element.remove();
  }

  update({data = []}) {
    this.data.push(...data);
    this._element.lastElementChild.lastElementChild.innerHTML = this.getChartColumns(this.data);
  }
}
