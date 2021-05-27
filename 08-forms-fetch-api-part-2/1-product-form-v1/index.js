import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';
const BACKEND_URL_HOST_PRODUCTS = '/api/rest/products';
const BACKEND_URL_HOST_CATEGORIES = '/api/rest/categories';
export default class ProductForm {
  subElements = {};

  currentItem = {
    title: '',
    description: '',
    images: [],
    categories: [],
    price: 0,
    discount: 0,
    quantity: 0,
    status: 1,
    subcategory: '',
  };

  initValues = {
    title: '',
    description: '',
    images: [],
    categories: [],
    price: 0,
    discount: 0,
    quantity: 0,
    status: 1,
    subcategory: ''
  }
  constructor (productId) {
    this.productId = productId;
  }

  composeCategory() {
    return this.currentItem.categories.reduce((acc, item) => {
      let itemTitle = item.title;
      let value = item.subcategories.reduce((acc, val) => {
        return [
          ...acc,
          { title: val.title,
            id: val.id,
            parent: itemTitle,
          }
        ];
      }, []);
    
      return [
        ...acc,
        ...value
      ];
    }, []);
  }

  async getValue() {
    this.url = new URL(BACKEND_URL_HOST_PRODUCTS, BACKEND_URL);
    this.url.searchParams.set('id', this.productId);
    try {
      const [currentItem] = await fetchJson(this.url);
      this.currentItem = currentItem || this.initValues;
    } catch (error) {
      console.log(error);
    }
  }

  async getCategory() {
    this.url = new URL(BACKEND_URL_HOST_CATEGORIES, BACKEND_URL);
    this.url.searchParams.set('_sort', 'weight');
    this.url.searchParams.set('_refs', 'subcategory');
    try {
      const categories = await fetchJson(this.url);
      this.currentItem.categories = categories || this.initValues.categories;
    } catch (error) {
      console.log(error);
    }
  }

  templateImages() {
    return `
      <ul class="sortable-list">
        ${this.currentItem.images.map(({url, source}) => {
          return `
            <li class="products-edit__imagelist-item sortable-list__item" style="">
            <input type="hidden" name="url" value="${url}">
            <input type="hidden" name="source" value="${source}">
            <span>
              <img src="icon-grab.svg" data-grab-handle="${source}" alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${url}">
              <span>${source}</span>
            </span>
            <button type="button">
              <img src="icon-trash.svg" data-delete-handle="${source}" alt="delete">
            </button>
          </li>`
        }).join('')} 
      </ul>`;
  }

  getSubElements(element) {
    return {
      images: element.querySelector('.sortable-list')
    }
  }

  eventListeners() {

    this.subElements.images.addEventListener('click', event =>  {
     
      if (event.target.dataset.deleteHandle) {
        const images = this.currentItem.images.filter(el => el.source !== event.target.dataset.deleteHandle)
        this.currentItem.images = []
        this.currentItem.images = images
        // console.log(images)
        // const element = document.createElement('div');
        // element.innerHTML = `<h1>123</h1>`;
        // this.element = element
        // const element = document.createElement('div');
        // element.innerHTML = `<h1>123</h1>`;
        // this.element = element;
        // console.log(event.target.closest('li').remove())
        // .parent.remove()
        // const element = document.createElement('div');
        // element.innerHTML = this.template();
        // this.element = element;
      }
      
    })
  }

  async render () {
    if (this.productId) {
      await this.getValue();
    }
    await this.getCategory();



    const element = document.createElement('div');
    element.innerHTML = this.template();
    this.element = element.firstElementChild;


    this.subElements = this.getSubElements(element);
    this.eventListeners();
  }

  template() {
    return `
        <div class="product-form">
          <form data-element="productForm" class="form-grid">
            <div class="form-group form-group__half_left">
              <fieldset>
                <label class="form-label">Название товара</label>
                <input required="" type="text" name="title" class="form-control" placeholder="Название товара" value="${escapeHtml(this.currentItem.title)}">
              </fieldset>
            </div>
            <div class="form-group form-group__wide">
              <label class="form-label">Описание</label>
              <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${escapeHtml(this.currentItem.description)}</textarea>
            </div>
            <div class="form-group form-group__wide" data-element="sortable-list-container">
              <label class="form-label">Фото</label>
              <div data-element="imageListContainer">
              ${ this.templateImages() }

              </div>
              <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
            </div>
            <div class="form-group form-group__half_left">
              <label class="form-label">Категория</label>
              <select class="form-control" name="subcategory">

              ${
                this.composeCategory().map(({parent, title, id}) => {
                  return `
                    <option value="${id}" ${this.currentItem.subcategory === id && 'selected' }>${parent} > ${title}</option>
                  `
                }).join('')
              }
                
    
              </select>
            </div>
            <div class="form-group form-group__half_left form-group__two-col">
              <fieldset>
                <label class="form-label">Цена ($)</label>
                <input required="" type="number" name="price" class="form-control" placeholder="100" value="${this.currentItem.price}">
              </fieldset>
              <fieldset>
                <label class="form-label">Скидка ($)</label>
                <input required="" type="number" name="discount" class="form-control" placeholder="0" value="${this.currentItem.discount}">
              </fieldset>
            </div>
            <div class="form-group form-group__part-half">
              <label class="form-label">Количество</label>
              <input required="" type="number" class="form-control" name="quantity" placeholder="1" value="${this.currentItem.quantity}">
            </div>
            <div class="form-group form-group__part-half">
              <label class="form-label">Статус</label>
              <select class="form-control" name="status">
                <option value="1">Активен</option>
                <option value="0" ${!this.currentItem.status && 'selected'} >Неактивен</option>
              </select>
            </div>
            <div class="form-buttons">
              <button type="submit" name="save" class="button-primary-outline">
                Сохранить товар
              </button>
            </div>
          </form>
        </div>
      `;
  }

}
