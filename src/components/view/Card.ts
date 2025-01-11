import { IActions, IProduct } from '../../types/index';
import { getElementOrLogError } from '../../utils/utils';

export interface ICard {
	render(data: IProduct): HTMLElement;
}

export class Card implements ICard {
	protected _colors: Record<string, string> = {
		"дополнительное": "additional",
		"софт-скил": "soft",
		"кнопка": "button",
		"хард-скил": "hard",
		"другое": "other",
	};

	protected _cardElement: HTMLElement | null = null;
	protected _categoryElement: HTMLElement | null = null;
	protected _titleElement: HTMLElement | null = null;
	protected _imageElement: HTMLImageElement | null = null;
	protected _priceElement: HTMLElement | null = null;

	constructor( protected template: HTMLTemplateElement, protected actions?: IActions) {
		this._cardElement = getElementOrLogError<HTMLElement>('.card', this.template.content).cloneNode(true) as HTMLElement;
		this._categoryElement = getElementOrLogError<HTMLElement>('.card__category', this._cardElement);
		this._titleElement = getElementOrLogError<HTMLElement>('.card__title', this._cardElement);
		this._imageElement = getElementOrLogError<HTMLImageElement>('.card__image', this._cardElement);
		this._priceElement = getElementOrLogError<HTMLElement>('.card__price', this._cardElement);

		if (this.actions?.onClick) {
			this._cardElement.addEventListener('click', this.actions.onClick);
		}
	}

	protected setTextContent(element: HTMLElement | null, value: unknown): void {
		if (element) {
			element.textContent = String(value);
		}
	}

	protected setPrice(value: number | null): string {
		return value === null ? 'Бесценно' : `${value} синапсов`;
	}

	protected updateCategoryElement(category: string): void {
		if (this._categoryElement) {
			this.setTextContent(this._categoryElement, category);
			this._categoryElement.className = `card__category card__category_${this._colors[category] || 'default'}`;
		}
	}

	protected updateCardElements(data: IProduct): void {
		this.updateCategoryElement(data.category);
		this.setTextContent(this._titleElement, data.title);

		if (this._imageElement) {
			this._imageElement.src = data.image;
			this._imageElement.alt = data.title;
		}

		this.setTextContent(this._priceElement, this.setPrice(data.price));
	}

	render(data: IProduct): HTMLElement {
		this.updateCardElements(data);
		return this._cardElement;
	}
}