class Tooltip {
  static instance;

  element;

  onPoinerOver = (event) => {
    const element = event.target.closest('[data-tooltip]')

    if (element) {
      const tooltipContent = element.dataset.tooltip;
      this.render(tooltipContent)

      document.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerMove = (event) => {
    if (this.element) {
      const shift = 10;
      this.element.style.position = 'absolute'
      this.element.style.top = `${event.clientY + shift}px`;
      this.element.style.left = `${event.clientX + shift}px`;
    }
  }

  onPoinerOut = () => {
    if (this.element) {
      this.element.remove()
      document.removeEventListener('pointermove', this.onPointerMove)
    }
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initialize() {
    this.initListeners()
  }

  initListeners() {
    document.addEventListener('pointerover', this.onPoinerOver);
    document.addEventListener('pointerout', this.onPoinerOut);
  }

  render(tooltipContent) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">${tooltipContent}</div>`

    this.element = wrapper.firstElementChild;

    document.body.append(this.element)
  }

  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPoinerOver)
    document.removeEventListener('pointermove', this.onPointerMove)
    document.removeEventListener('pointerout', this.onPoinerOut)
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
