import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;

  defaultProductData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0,
    images: []
  };

  onSubmit = (event) => {
    event.preventDefault()
    this.save()
  }

  constructor(productId = null) {
    this.productId = productId;
    this.isEdit = this.productId !== null;
  }

  async render() {
    const categoriesPromise = this.loadCategoriesData()
    const productPromise = (this.isEdit) ? this.loadProductData() : Promise.resolve([this.defaultProductData])

    const [categoriesData, [productData]] = await Promise.all([categoriesPromise, productPromise])
    this.categories = categoriesData;
    this.data = productData;

    this.element = this.getElement()
    this.subElements = this.getSubElements(this.element)
    this.setData(this.subElements)

    this.initListeners()

    return this.element
  }

 async save() {
      const product = this.getData()
      const url = new URL('/api/rest/products', BACKEND_URL);

      const result = await fetchJson(url, {
        method: this.isEdit ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
  }

  dispatchEvent(id) {
    const event = this.isEdit ? new CustomEvent('product-updated', { detail: id }): new CustomEvent('product-saved');
    this.element.dispatchEvent(event);
  }

  getData() {
    const { productForm, imageListContainer} = this.subElements;

    const fields = Object.keys(this.defaultProductData);
    const imagesHTMLCollection = (imageListContainer) 
      ? imageListContainer.querySelectorAll('.sortable-table__cell-img')
      : [];

    const fieldsImages = ['images'];
    const fieldsNumber = ['quantity', 'status', 'price', 'discount']

    const values = {};
    values.id = this.productId;

    for (const field of fields) {
      if (fieldsImages.includes(field)) {
          values.images = [];

          for (const image of imagesHTMLCollection) {
            values.images.push({
              url: image.src,
              source: image.alt
            });
          }
        
      } else {
        const fieldElement = productForm.querySelector(`#${field}`);

        values[field] = fieldsNumber.includes(field) 
          ? parseInt(fieldElement.value) 
          : fieldElement.value
      }
  }
  return values;
}

  initListeners() {
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
  }

  setData(subElements) {
    const fieldElements = subElements.productForm.querySelectorAll('.form-control');

    for (const field of fieldElements) {
      field.value = this.data[field.name]
    }
  }

  getElement() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate(this.isEdit);

    return wrapper.firstElementChild;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  getTemplate(isEdit) {
    return `
    <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>

        ${(this.isEdit) ? this.getImageList(this.data.images) : ''}

        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        
        ${this.getSubcategoriesElements(this.categories)}
        
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          ${(this.isEdit) ? 'Сохранить' : 'Добавить'} товар
        </button>
      </div>
    </form>
    `
  }

  getImageList(images) {
    return `
      <div data-element="imageListContainer">
        <ul class="sortable-list">
          ${images.map((item) => {
            return `
            <li class="products-edit__imagelist-item sortable-list__item" style="">
              <input type="hidden" name="url" value=${escapeHtml(item.url)}>
              <input type="hidden" name="source" value=${escapeHtml(item.source)}>

                <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src=${escapeHtml(item.url)}>
                <span>${escapeHtml(item.source)}</span>
                </span>

              <button type="button">
              <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button>
            </li>
            `
          })
          .join('')}
        </ul>
      </div>
    `
  }

  loadProductData() {
    this.url = new URL('/api/rest/products', BACKEND_URL)
    this.url.searchParams.set('id', this.productId)

    return fetchJson(this.url)
  }

  getSubcategoriesElements(categories) {
    return `
      <select class="form-control" name="subcategory" id="subcategory">
        ${categories.map((category) => {
          return category.subcategories.map((subcategory) => {
            return `<option value=${subcategory.id}>${category.title} &gt; ${subcategory.title}</option>`
          })
        })
        .join('')
        }
      </select>
    `
  }

  loadCategoriesData() {
    this.url = new URL('/api/rest/categories', BACKEND_URL)
    this.url.searchParams.set('_sort', 'weight')
    this.url.searchParams.set('_refs', 'subcategory')

    return fetchJson(this.url);
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
