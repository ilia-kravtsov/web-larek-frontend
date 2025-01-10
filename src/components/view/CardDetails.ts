import { Card } from "./Card";
import { IActions, IProduct } from '../../types';
import { IEvents } from '../base/events';
import { getElementOrLogError } from '../../utils/utils';

export interface ICardDetails {
	descriptionElement: HTMLElement;
	actionButton: HTMLElement;
	render(product: IProduct): HTMLElement;
}

export class CardDetails extends Card implements ICardDetails {
	descriptionElement: HTMLElement;
	actionButton: HTMLElement;

	constructor(template: HTMLTemplateElement, private events: IEvents, actions?: IActions) {
		super(template, actions);

		this.descriptionElement = getElementOrLogError<HTMLElement>('.card__text', this._cardElement);
		this.actionButton = getElementOrLogError<HTMLButtonElement>('.card__button', this._cardElement);

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