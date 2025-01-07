import { IEvents } from "../base/events";
import { getElementOrLogError } from '../../utils/utils';

export interface IOrder {
	form: HTMLFormElement;
	buttons: HTMLButtonElement[];
	paymentMethod: string;
	errorMessages: HTMLElement;
	render(): HTMLElement;
}

export class Order implements IOrder {
	form: HTMLFormElement;
	buttons: HTMLButtonElement[];
	submitButton: HTMLButtonElement;
	errorMessages: HTMLElement;

	constructor(template: HTMLTemplateElement, protected events: IEvents) {
		this.form = template.content.querySelector('.form').cloneNode(true) as HTMLFormElement;
		this.buttons = Array.from(this.form.querySelectorAll('.button_alt'));
		this.submitButton = getElementOrLogError<HTMLButtonElement>(this.form, '.order__button');
		this.errorMessages = getElementOrLogError<HTMLElement>(this.form, '.form__errors');

		this.buttons.forEach(button => {
			button.addEventListener('click', () => {
				this.paymentMethod = button.name;
				events.emit('order:paymentMethod', { method: button.name });
			});
		});

		this.form.addEventListener('input', (event: Event) => {
			const target = event.target as HTMLInputElement;
			this.events.emit('order:changeAddressValue', { field: target.name, value: target.value });
		});

		this.form.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			this.events.emit('contacts:open');
		});
	}

	set paymentMethod(payment: string) {
		this.buttons.forEach(button => {
			button.classList.toggle('button_alt-active', button.name === payment);
		});
	}

	set isValid(value: boolean) {
		this.submitButton.disabled = !value;
	}

	render() {
		return this.form;
	}
}
