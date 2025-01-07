import { IActions, IProduct } from '../../types/index';

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

	protected _cardElement: HTMLElement;
	protected _categoryElement: HTMLElement | null = null;
	protected _titleElement: HTMLElement | null = null;
	protected _imageElement: HTMLImageElement | null = null;
	protected _priceElement: HTMLElement | null = null;

	constructor(
		protected template: HTMLTemplateElement,
		protected actions?: IActions
	) {
		this._cardElement = this.template.content.querySelector('.card')!.cloneNode(true) as HTMLElement;
		this._categoryElement = this._cardElement.querySelector('.card__category');
		this._titleElement = this._cardElement.querySelector('.card__title') as HTMLElement | null;
		this._imageElement = this._cardElement.querySelector('.card__image') as HTMLImageElement | null;
		this._priceElement = this._cardElement.querySelector('.card__price') as HTMLElement | null;

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