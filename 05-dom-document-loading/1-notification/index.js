export default class NotificationMessage {
  static lastElement = {};

  constructor(contentText = '', {
    duration = 0,
    type = 'success'
  } = {}) {
    this.contentText = contentText;
    this.duration = duration;
    this.type = type;
    this.element = {};
  }
  show() {
    if (Object.keys(NotificationMessage.lastElement).length) {
      NotificationMessage.lastElement.remove();
    }

    this.render()
      
    NotificationMessage.lastElement = this;
  }
  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    document.body.append(this.element)
    setTimeout(() => {
      this.remove();
    }, this.duration)
  }

  getTemplate() {
    return `
      <div class="notification success" style="--value:${this.getFormattedDuration()}">
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
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = {};
    NotificationMessage.lastElement = {};
  }
}
