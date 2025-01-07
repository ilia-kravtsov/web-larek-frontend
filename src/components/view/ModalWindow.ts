import { IEvents } from "../base/events";
import { getElementOrLogError } from '../../utils/utils';

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
		this.closeButton = getElementOrLogError<HTMLButtonElement>(container, '.modal__close');
		this.content = getElementOrLogError<HTMLElement>(container, '.modal__content');
		this.wrapper = getElementOrLogError<HTMLElement>(document.body, '.page__wrapper');

		this.initializeEventListeners();
	}

	private initializeEventListeners(): void {
		this.closeButton.addEventListener('click', () => this.hide());
		this.container.addEventListener('click', () => this.hide());
		const modalContent = getElementOrLogError<HTMLElement>(this.container, '.modal__container');
		modalContent.addEventListener('click', (event) => event.stopPropagation());
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
