import { Card } from "./Card";
import { IActions, IProduct } from '../../types';
import { IEvents } from '../base/events';
import { getElementOrLogError } from '../../utils/utils';

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

		this.descriptionElement = getElementOrLogError(this._cardElement, '.card__text');
		this.actionButton = getElementOrLogError(this._cardElement, '.card__button');

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

	render(product: IProduct): HTMLElement {
		this.updateCardElements(product);
		this.setTextContent(this.descriptionElement, product.description);
		this.actionButton.textContent = this.getActionButtonText(product);
		return this._cardElement;
	}
}