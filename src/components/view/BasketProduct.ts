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
		const content = getElementOrLogError<HTMLElement>('.basket__item', template.content);
		this.basketItem = content.cloneNode(true) as HTMLElement;
		this.indexElement = getElementOrLogError('.basket__item-index', this.basketItem);
		this.titleElement = getElementOrLogError('.card__title', this.basketItem);
		this.priceElement = getElementOrLogError('.card__price', this.basketItem);
		this.deleteButton = getElementOrLogError<HTMLButtonElement>('.basket__item-delete', this.basketItem);

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