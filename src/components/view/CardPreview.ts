import { Card } from "./Card";
import { IActions, IProduct } from '../../types';
import { IEvents } from '../base/events';

export interface ICardPreview {
	descriptionElement: HTMLElement;
	actionButton: HTMLElement;
	render(product: IProduct): HTMLElement;
}

export class CardPreview extends Card implements ICardPreview {
	descriptionElement: HTMLElement;
	actionButton: HTMLElement;

	constructor(template: HTMLTemplateElement, private events: IEvents, actions?: IActions) {
		super(template, actions);

		this.descriptionElement = this.getElementOrLogError(this._cardElement, '.card__text');
		this.actionButton = this.getElementOrLogError(this._cardElement, '.card__button');

		this.initializeEventListeners();
	}

	private initializeEventListeners(): void {
		this.actionButton.addEventListener('click', () => this.events.emit('product:addToBasket'));
	}

	private getActionButtonText(product: IProduct): string {
		if (product.price) {
			return 'Купить';
		} else {
			this.actionButton.setAttribute('disabled', 'true');
			return 'Не продается';
		}
	}

	private getElementOrLogError<T extends Element>(parent: HTMLElement, selector: string): T {
		const element = parent.querySelector<T>(selector);
		if (!element) {
			console.error(`Element not found for selector: ${selector}`);
		}
		return element;
	}

	render(product: IProduct): HTMLElement {
		this.updateCardElements(product);
		this.setTextContent(this.descriptionElement, product.description);
		this.actionButton.textContent = this.getActionButtonText(product);
		return this._cardElement;
	}
}