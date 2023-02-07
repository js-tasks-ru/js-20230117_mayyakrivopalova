export default class NotificationMessage {
  static existElement = null;

  constructor(contentText = '', {
    duration = 1000,
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

    if (NotificationMessage.existElement) {
      NotificationMessage.existElement.destroy();
    }

    this.render()
      
    NotificationMessage.existElement = this;
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
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
    }

    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    this.remove();
    NotificationMessage.existElement = null;
  }
}
