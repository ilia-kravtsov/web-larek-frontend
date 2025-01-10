import { IEvents } from "../base/events";
import { getElementOrLogError } from '../../utils/utils';

export interface IRenderSuccessWindow {
	success: HTMLElement;
	description: HTMLElement;
	button: HTMLButtonElement;
	render(total: number): HTMLElement;
}

export class RenderSuccessWindow implements IRenderSuccessWindow {
	success: HTMLElement;
	description: HTMLElement;
	button: HTMLButtonElement;

	constructor(template: HTMLTemplateElement, private events: IEvents) {
		const content = template.content.cloneNode(true) as DocumentFragment;
		this.success = content.querySelector('.order-success') as HTMLElement;
		this.description = getElementOrLogError<HTMLElement>(this.success, '.order-success__description');
		this.button = getElementOrLogError<HTMLButtonElement>(this.success, '.order-success__close');

		this.initEventListeners();
	}

	private initEventListeners(): void {
		this.button.addEventListener('click', () => this.events.emit('renderSuccessWindow:close'));
	}

	render(total: number): HTMLElement {
		this.description.textContent = `Списано ${total} синапсов`;
		return this.success;
	}
}