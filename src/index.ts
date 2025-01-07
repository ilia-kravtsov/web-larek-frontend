import './scss/styles.scss';
import { ApiService } from './components/model/ApiService';
import { API_URL, CDN_URL } from './utils/constants';
import { ApiListResponse } from './components/base/api';
import { IOrderRequest, IProduct, OrderError } from './types/index';
import { EventEmitter } from './components/base/events';
import { DataService } from './components/model/DataService';
import { Card } from './components/view/Card';
import { ensureElement } from './utils/utils';
import { CardPreview } from './components/view/CardPreview';
import { ModalWindow } from './components/view/ModalWindow';
import { BasketService } from './components/model/BasketService';
import { Basket } from './components/view/Basket';
import { BasketProduct } from './components/view/BasketProduct';
import { Order } from './components/view/Order';
import { OrderService } from './components/model/OrderService';

const cardCatalogElement = document.querySelector('#card-catalog') as HTMLTemplateElement;
const cardPreviewElement = document.querySelector('#card-preview') as HTMLTemplateElement;
const basketElement = document.querySelector('#basket') as HTMLTemplateElement;
const cardBasketElement = document.querySelector('#card-basket') as HTMLTemplateElement;
const orderElement = document.querySelector('#order') as HTMLTemplateElement;

const apiService = new ApiService(CDN_URL, API_URL);
const events = new EventEmitter();
const dataService = new DataService(events);
const modal = new ModalWindow(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(basketElement, events);
const basketService = new BasketService();
const orderService = new OrderService(events);
const order = new Order(orderElement, events);

apiService.getProductList()
	.then(function (data: ApiListResponse<IProduct>) {
		dataService.products = data.items;
	})
	.catch(error => console.log(error))

events.on('products:received', () => {
	dataService.products.forEach(product => {
		const card = new Card(cardCatalogElement, { onClick: () => events.emit('product:select', product) });
		ensureElement<HTMLElement>('.gallery').append(card.render(product));
	})
})

events.on('product:select', (item: IProduct) => { dataService.modalWindowProduct(item) });

events.on('modalWindow:open', (item: IProduct) => {
	const cardPreviewElementInstance = new CardPreview(cardPreviewElement, events)
	modal.setContent(cardPreviewElementInstance.render(item))
	modal.render();
});

events.on('product:addToBasket', () => {
	basketService.addProduct(dataService.product);
	basket.updateHeaderCounter(basketService.getProductCount());
	modal.hide();
});

events.on('basket:open', () => {
	basket.updateTotalPrice(basketService.getTotalPrice());
	basket.items = basketService.products.map((item, index) => {
		const basketProduct = new BasketProduct(cardBasketElement, {
			onClick: () => events.emit('basket:removeProductFromBasket', item),
		});
		return basketProduct.render(item, index + 1);
	});

	modal.setContent(basket.render());
	modal.render();
});

events.on('basket:removeProductFromBasket', (item: IProduct) => {
	basketService.removeProduct(item);
	basket.updateHeaderCounter(basketService.getProductCount());
	basket.updateTotalPrice(basketService.getTotalPrice());
	basket.items = basketService.products.map((product, index) => {
		const basketItem = new BasketProduct(cardBasketElement, {
			onClick: () => events.emit('basket:removeProductFromBasket', product),
		});
		return basketItem.render(product, index + 1);
	});
});

events.on('order:open', () => {
	modal.setContent(order.render())
	modal.render();
	orderService.items = basketService.products.map(item => item.id);
});

events.on('order:paymentSelection', (button: HTMLButtonElement) => { orderService.payment = button.name })

events.on(`order:changeAddressValue`, (data: { field: string, value: string }) => {
	orderService.setAddress(data.field, data.value);
});

events.on('orderError:address', (errors: Partial<IOrderRequest>) => {
	const { address, payment } = errors;
	order.isValid = !address && !payment;
	order.errorMessages.textContent = [address, payment]
		.filter(Boolean)
		.join('; ') || '';
});

