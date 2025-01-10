import './scss/styles.scss';
import { ApiService } from './components/model/ApiService';
import { API_URL, CDN_URL } from './utils/constants';
import { ApiListResponse } from './components/base/api';
import { EventHandler, EventName, IOrderRequest, IProduct } from './types/index';
import { EventEmitter } from './components/base/events';
import { DataService } from './components/model/DataService';
import { Card } from './components/view/Card';
import { ensureElement, handleErrors } from './utils/utils';
import { CardPreview } from './components/view/CardPreview';
import { ModalWindow } from './components/view/ModalWindow';
import { BasketService } from './components/model/BasketService';
import { Basket } from './components/view/Basket';
import { BasketProduct } from './components/view/BasketProduct';
import { Order } from './components/view/Order';
import { OrderService } from './components/model/OrderService';
import { Contacts } from './components/view/Contacts';
import { RenderSuccessWindow } from './components/view/RenderSuccessWindow';

const cardCatalogElement = document.querySelector('#card-catalog') as HTMLTemplateElement;
const cardPreviewElement = document.querySelector('#card-preview') as HTMLTemplateElement;
const basketElement = document.querySelector('#basket') as HTMLTemplateElement;
const cardBasketElement = document.querySelector('#card-basket') as HTMLTemplateElement;
const orderElement = document.querySelector('#order') as HTMLTemplateElement;
const contactsElement = document.querySelector('#contacts') as HTMLTemplateElement;
const successTemplate = document.querySelector('#success') as HTMLTemplateElement;

const apiService = new ApiService(CDN_URL, API_URL);
const events = new EventEmitter();
const dataService = new DataService(events);
const modal = new ModalWindow(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(basketElement, events);
const basketService = new BasketService();
const orderService = new OrderService(events);
const order = new Order(orderElement, events);
const contacts = new Contacts(contactsElement, events);

apiService.getProductList()
	.then((data: ApiListResponse<IProduct>) => {
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

events.on('order:paymentMethod', (data: { method: string }) => {
	orderService.payment = data.method;
});

events.on(`order:changeAddressValue`, (data: { field: string, value: string }) => {
	orderService.setAddress(data.field, data.value);
});

events.on('orderError:address&paymentMethod', (errors: Partial<IOrderRequest>) => {
	handleErrors(
		errors,
		['address', 'payment'],
		isValid => (order.isValid = isValid),
		message => (order.errorMessages.textContent = message)
	);
});

events.on('contacts:open', () => {
	orderService.total = basketService.getTotalPrice();
	modal.setContent(contacts.render());
	modal.render();
});

events.on(`contacts:inputChange`, (data: { field: string, value: string }) => {
	orderService.setContactData(data.field, data.value);
});

events.on('orderError:isValid', (errors: Partial<IOrderRequest>) => {
	handleErrors(
		errors,
		['email', 'phone'],
		isValid => (contacts.isValid = isValid),
		message => (contacts.errorMessages.textContent = message)
	);
});

events.on('renderSuccessWindow:open', async () => {
	try {
		const orderData = orderService.updateOrderData();
		const data = await apiService.postOrderRequest(orderData);
		console.log(data);
		const renderSuccessWindow = new RenderSuccessWindow(successTemplate, events);
		const totalPrice = basketService.getTotalPrice();
		modal.setContent(renderSuccessWindow.render(totalPrice));

		basketService.clear();
		basket.updateHeaderCounter(basketService.getProductCount());
		modal.render();
	} catch (error) {
		console.error('Error processing order:', error);
	}
});

const handleModalEvent = (event: EventName, action: EventHandler): void => {
	events.on(event, action);
};

handleModalEvent('renderSuccessWindow:close', () => modal.hide());
handleModalEvent('modal:open', () => modal.isLocked = true);
handleModalEvent('modal:close', () => modal.isLocked = false);