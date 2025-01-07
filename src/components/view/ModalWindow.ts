import { IEvents } from "../base/events";

export interface IModalWindow {
	show(): void;
	hide(): void;
	setContent(content: HTMLElement): void;
	render(): HTMLElement;
}

export class ModalWindow implements IModalWindow {
	private readonly container: HTMLElement;
	private closeButton: HTMLButtonElement;
	private content: HTMLElement;
	private wrapper: HTMLElement;

	constructor(container: HTMLElement, private events: IEvents) {
		this.container = container;
		this.closeButton = this.getElementOrLogError<HTMLButtonElement>(container, '.modal__close');
		this.content = this.getElementOrLogError<HTMLElement>(container, '.modal__content');
		this.wrapper = this.getElementOrLogError<HTMLElement>(document.body, '.page__wrapper');

		this.initializeEventListeners();
	}

	private initializeEventListeners(): void {
		this.closeButton.addEventListener('click', () => this.hide());
		this.container.addEventListener('click', () => this.hide());
		const modalContent = this.getElementOrLogError<HTMLElement>(this.container, '.modal__container');
		modalContent.addEventListener('click', (event) => event.stopPropagation());
	}

	private getElementOrLogError<T extends Element>(parent: Element, selector: string): T {
		const element = parent.querySelector<T>(selector);
		if (!element) {
			console.error(`Element not found for selector: ${selector}`);
		}
		return element;
	}

	setContent(content: HTMLElement): void {
		this.content.replaceChildren(content);
	}

	show(): void {
		this.container.classList.add('modal_active');
		this.events.emit('modal:open');
	}

	hide(): void {
		this.container.classList.remove('modal_active');
		this.clearContent();
		this.events.emit('modal:close');
	}

	private clearContent(): void {
		this.content.innerHTML = '';
	}

	set isLocked(locked: boolean) {
		this.wrapper.classList.toggle('page__wrapper_locked', locked);
	}

	render(): HTMLElement {
		this.show();
		return this.container;
	}
}
