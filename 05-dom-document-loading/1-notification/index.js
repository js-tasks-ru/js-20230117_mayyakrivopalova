export default class NotificationMessage {
  static lastElement = {};

  constructor(contentText = '', {
    duration = 0,
    type = 'success'
  } = {}) {
    this.contentText = contentText;
    this.duration = duration;
    this.type = type;
    this.element = this.getElement();
  }

  getElement() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    return element.firstElementChild;
  }

  show(target = document.body) {
    this.target = target;

    if (Object.keys(NotificationMessage.lastElement).length) {
      NotificationMessage.lastElement.destroy();
    }

    this.render()
      
    NotificationMessage.lastElement = this;
  }
  render() {
    this.target.append(this.element)

    this.timeoutID = setTimeout(() => {
      this.destroy();
    }, this.duration)
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.getFormattedDuration()}">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.contentText}
          </div>
        </div>
      </div>
    `;
  }

  getFormattedDuration() {
    const sec = this.duration / 1000;
    return `${sec}s`
  }

  remove() {
    clearTimeout(this.timeoutID);

    if (this.element) {
      this.element.remove();
      this.element = {};
    }
  }

  destroy() {
    this.remove();
    NotificationMessage.lastElement = {};
  }
}
