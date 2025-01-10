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
		this.success = getElementOrLogError<HTMLElement>('.order-success', content);
		this.description = getElementOrLogError<HTMLElement>('.order-success__description', this.success);
		this.button = getElementOrLogError<HTMLButtonElement>('.order-success__close', this.success);

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