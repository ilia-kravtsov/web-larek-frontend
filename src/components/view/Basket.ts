import { createElement, getElementOrLogError } from '../../utils/utils';
import { IEvents } from "../base/events";

export interface IBasket {
	container: HTMLElement;
	title: HTMLElement;
	itemList: HTMLElement;
	button: HTMLButtonElement;
	totalPrice: HTMLElement;
	headerButton: HTMLButtonElement;
	headerCounter: HTMLElement;
	updateHeaderCounter(value: number): void;
	updateTotalPrice(price: number): void;
	render(): HTMLElement;
}

export class Basket implements IBasket {
	container: HTMLElement;
	title: HTMLElement;
	itemList: HTMLElement;
	button: HTMLButtonElement;
	totalPrice: HTMLElement;
	headerButton: HTMLButtonElement;
	headerCounter: HTMLElement;

	constructor(template: HTMLTemplateElement, protected events: IEvents) {
		this.container = getElementOrLogError<HTMLElement>('.basket', template.content).cloneNode(true) as HTMLElement;
		if (!this.container) console.error('Basket container not found');
		this.title = getElementOrLogError<HTMLElement>('.modal__title', this.container);
		this.itemList = getElementOrLogError<HTMLElement>('.basket__list', this.container);
		this.button = getElementOrLogError<HTMLButtonElement>('.basket__button', this.container);
		this.totalPrice = getElementOrLogError<HTMLElement>('.basket__price', this.container);
		this.headerButton = getElementOrLogError<HTMLButtonElement>('.header__basket', document.body);
		this.headerCounter = getElementOrLogError<HTMLElement>('.header__basket-counter', document.body);

		this.button.addEventListener('click', () => this.events.emit('order:open'));
		this.headerButton.addEventListener('click', () => this.events.emit('basket:open'));

		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this.itemList.replaceChildren(...items);
			this.button.removeAttribute('disabled');
		} else {
			this.button.setAttribute('disabled', 'disabled');
			this.itemList.replaceChildren(createElement<HTMLParagraphElement>('p', { textContent: 'Корзина пуста' }));
		}
	}

	updateHeaderCounter(value: number) {
		this.headerCounter.textContent = String(value);
	}

	updateTotalPrice(price: number) {
		this.totalPrice.textContent = `${price} синапсов`;
	}

	render() {
		this.title.textContent = 'Корзина';
		return this.container;
	}
}
