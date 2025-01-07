import { createElement } from "../../utils/utils";
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
		this.container = template.content.querySelector('.basket')?.cloneNode(true) as HTMLElement;
		if (!this.container) console.error('Basket container not found');
		this.title = this.getElementOrLogError(this.container, '.modal__title');
		this.itemList = this.getElementOrLogError(this.container, '.basket__list');
		this.button = this.getElementOrLogError(this.container, '.basket__button');
		this.totalPrice = this.getElementOrLogError(this.container, '.basket__price');
		this.headerButton = this.getElementOrLogError(document.body, '.header__basket');
		this.headerCounter = this.getElementOrLogError(document.body, '.header__basket-counter');

		this.button.addEventListener('click', () => this.events.emit('order:open'));
		this.headerButton.addEventListener('click', () => this.events.emit('basket:open'));

		this.items = [];
	}

	getElementOrLogError<T extends Element>(parent: Element, selector: string): T {
		const element = parent.querySelector<T>(selector);
		if (!element) {
			console.error(`Element with selector "${selector}" not found.`);
		}
		return element;
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
