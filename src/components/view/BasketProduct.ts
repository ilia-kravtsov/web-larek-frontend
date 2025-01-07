import { IActions, IProduct } from '../../types';
import { getElementOrLogError } from '../../utils/utils';

export interface IBasketProduct {
	basketItem: HTMLElement;
	render(data: IProduct, index: number): HTMLElement;
}

export class BasketProduct implements IBasketProduct {
	public basketItem: HTMLElement;
	private indexElement: HTMLElement;
	private titleElement: HTMLElement;
	private priceElement: HTMLElement;
	private deleteButton: HTMLButtonElement;

	constructor(template: HTMLTemplateElement, private actions?: IActions) {
		const content = template.content.querySelector('.basket__item');
		if (!content) {
			console.error('Template content must contain a .basket__item element');
		}

		this.basketItem = content.cloneNode(true) as HTMLElement;
		this.indexElement = getElementOrLogError(this.basketItem, '.basket__item-index');
		this.titleElement = getElementOrLogError(this.basketItem, '.card__title');
		this.priceElement = getElementOrLogError(this.basketItem, '.card__price');
		this.deleteButton = getElementOrLogError<HTMLButtonElement>(this.basketItem, '.basket__item-delete');

		this.removeButton();
	}

	private removeButton(): void {
		if (this.actions?.onClick) {
			this.deleteButton.addEventListener('click', this.actions.onClick);
		}
	}

	private formatPrice(value: number | null): string {
		return value === null ? 'Бесценно' : `${value} синапсов`;
	}

	render(data: IProduct, index: number): HTMLElement {
		this.indexElement.textContent = String(index);
		this.titleElement.textContent = data.title;
		this.priceElement.textContent = this.formatPrice(data.price);
		return this.basketItem;
	}
}