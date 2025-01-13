import './scss/styles.scss';
import { ApiService } from './components/model/ApiService';
import { API_URL, CDN_URL } from './utils/constants';
import { ApiListResponse } from './components/base/api';
import { IOrderRequest, IProduct, PaymentMethod } from './types/index';
import { EventEmitter } from './components/base/events';
import { DataService } from './components/model/DataService';
import { Card } from './components/view/Card';
import { ensureElement, getElementOrLogError, handleErrors, handleModalEvent } from './utils/utils';
import { CardDetails } from './components/view/CardDetails';
import { ModalWindow } from './components/view/ModalWindow';
import { BasketService } from './components/model/BasketService';
import { Basket } from './components/view/Basket';
import { BasketProduct } from './components/view/BasketProduct';
import { Order } from './components/view/Order';
import { OrderService } from './components/model/OrderService';
import { Contacts } from './components/view/Contacts';
import { RenderSuccessWindow } from './components/view/RenderSuccessWindow';

// Получаю элементы, либо вывожу ошибку, если элемент не найден
const cardCatalogElement = getElementOrLogError<HTMLTemplateElement>('#card-catalog');
const cardPreviewElement = getElementOrLogError<HTMLTemplateElement>('#card-preview');
const basketElement = getElementOrLogError<HTMLTemplateElement>('#basket');
const cardBasketElement = getElementOrLogError<HTMLTemplateElement>('#card-basket');
const orderElement = getElementOrLogError<HTMLTemplateElement>('#order');
const contactsElement = getElementOrLogError<HTMLTemplateElement>('#contacts');
const successTemplate = getElementOrLogError<HTMLTemplateElement>('#success');

// Создаю экземпляры классов для работы с данными и событиями
const apiService = new ApiService(CDN_URL, API_URL);
const events = new EventEmitter();
const dataService = new DataService(events);
const modal = new ModalWindow(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(basketElement, events);
const basketService = new BasketService();
const orderService = new OrderService(events);
const order = new Order(orderElement, events);
const contacts = new Contacts(contactsElement, events);

// Запрашиваю данные с API и обрабатываю ошибки
apiService.getProductList()
	.then((data: ApiListResponse<IProduct>) => {
		dataService.products = data.items;
	})
	.catch(error => console.log(error))

// Обрабатываю событие получения товаров и реализую рендеринг карточек товаров
events.on('products:received', () => {
	dataService.products.forEach(product => {
		const card = new Card(cardCatalogElement, { onClick: () => events.emit('product:select', product) });
		ensureElement<HTMLElement>('.gallery').append(card.render(product));
	})
})

// Выбираю конкретный товар
events.on('product:select', (item: IProduct) => { dataService.modalWindowProduct(item) });

// Обрабатываю событие открытия модального окна товара
events.on('modalWindow:open', (item: IProduct) => {
	const cardPreviewElementInstance = new CardDetails(cardPreviewElement, events)
	modal.setContent(cardPreviewElementInstance.render(item))
	modal.render();
});

// Обрабатываю событие добавления товара в корзину
events.on('product:addToBasket', () => {
	basketService.addProduct(dataService.product);
	basket.updateHeaderCounter(basketService.getProductCount());
	modal.hide();
});

// Обрабатываю событие открытия корзины и отображения ее содержимого
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

// Обрабатываю событие удаления товара из корзины
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

// Обрабатываю событие открытия формы заказа
events.on('order:open', () => {
	modal.setContent(order.render())
	modal.render();
	orderService.items = basketService.products.map(item => item.id);
});

// Обрабатываю событие выбора метода оплаты
events.on('order:paymentMethod', (data: { method: PaymentMethod }) => {
	orderService.payment = data.method;
	orderService.validateOrder();
});

// Обрабатываю событие изменения значения в поле адреса
events.on(`order:changeAddressValue`, (data: { field: string, value: string }) => {
	orderService.setAddress(data.field, data.value);
});

// Обрабатываю ошибки валидации формы заказа (адрес или метод оплаты)
events.on('orderForm:update', ({ isValid, errors }: { isValid: boolean; errors: Partial<IOrderRequest> }) => {
	handleErrors(
		errors,
		['address', 'payment'],
		() => (order.isValid = isValid),
		message => (order.errorMessages.textContent = message)
	);
});

// Обрабатываю событие открытия формы контактов и отображения ее содержимого
events.on('contacts:open', () => {
	orderService.total = basketService.getTotalPrice();
	modal.setContent(contacts.render());
	modal.render();
});

// Обрабатываю событие изменения данных в полях формы контактов
events.on(`contacts:inputChange`, (data: { field: string, value: string }) => {
	orderService.setContactData(data.field, data.value);
});

// Обрабатываю ошибки валидации формы контактов (email и телефон)
events.on('orderError:isValid', (errors: Partial<IOrderRequest>) => {
	handleErrors(
		errors,
		['email', 'phone'],
		isValid => (contacts.isValid = isValid),
		message => (contacts.errorMessages.textContent = message)
	);
});

// Обрабатываю событие открытия модального окна с успешным результатом заказа
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

// Добавил утилитарную функцию для добавления обработчика события
handleModalEvent(events, 'renderSuccessWindow:close', () => modal.hide());
handleModalEvent(events, 'modal:open', () => modal.isLocked = true);
handleModalEvent(events, 'modal:close', () => modal.isLocked = false);