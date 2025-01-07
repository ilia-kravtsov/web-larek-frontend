import './scss/styles.scss';
import { ApiService } from './components/model/ApiService';
import { API_URL, CDN_URL } from './utils/constants';
import { ApiListResponse } from './components/base/api';
import { IProduct } from './types/index';
import { EventEmitter } from './components/base/events';
import { DataService } from './components/model/DataService';
import { Card } from './components/view/Card';
import { ensureElement } from './utils/utils';
import { CardPreview } from './components/view/CardPreview';
import { ModalWindow } from './components/view/ModalWindow';

const cardCatalogElement = document.querySelector('#card-catalog') as HTMLTemplateElement;
const cardPreviewElement = document.querySelector('#card-preview') as HTMLTemplateElement;

const apiModel = new ApiService(CDN_URL, API_URL);
const events = new EventEmitter();
const dataModel = new DataService(events);
const modal = new ModalWindow(ensureElement<HTMLElement>('#modal-container'), events);

apiModel.getProductList()
	.then(function (data: ApiListResponse<IProduct>) {
		dataModel.products = data.items;
	})
	.catch(error => console.log(error))

events.on('products:received', () => {
	dataModel.products.forEach(product => {
		const card = new Card(cardCatalogElement, { onClick: () => events.emit('product:select', product) });
		ensureElement<HTMLElement>('.gallery').append(card.render(product));
	})
})

events.on('product:select', (item: IProduct) => { dataModel.modalWindowProduct(item) });

events.on('modalWindow:open', (item: IProduct) => {
	const cardPreviewElementInstance = new CardPreview(cardPreviewElement, events)
	modal.setContent(cardPreviewElementInstance.render(item))
	modal.render();
});

