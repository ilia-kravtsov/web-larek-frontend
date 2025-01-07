import { IEvents } from "../base/events";
import { getElementOrLogError } from '../../utils/utils';

export interface IContacts {
	form: HTMLFormElement;
	inputs: HTMLInputElement[];
	submitButton: HTMLButtonElement;
	errorMessages: HTMLElement;
	render(): HTMLElement;
}

export class Contacts implements IContacts {
	form: HTMLFormElement;
	inputs: HTMLInputElement[];
	submitButton: HTMLButtonElement;
	errorMessages: HTMLElement;

	constructor(template: HTMLTemplateElement, protected events: IEvents) {
		this.form = template.content.querySelector('.form').cloneNode(true) as HTMLFormElement;
		this.inputs = Array.from(this.form.querySelectorAll('.form__input'));
		this.submitButton = getElementOrLogError<HTMLButtonElement>(this.form, '.button');
		this.errorMessages = getElementOrLogError<HTMLElement>(this.form, '.form__errors');

		this.attachInputListeners();
		this.attachFormSubmitListener();
	}

	set isValid(value: boolean) {
		this.submitButton.disabled = !value;
	}

	render(): HTMLElement {
		return this.form;
	}

	private attachInputListeners(): void {
		this.inputs.forEach(input => {
			input.addEventListener('input', (event) => {
				const target = event.target as HTMLInputElement;
				const fieldName = target.name;
				const fieldValue = target.value;
				this.events.emit('contacts:inputChange', { field: fieldName, value: fieldValue });
			});
		});
	}

	private attachFormSubmitListener(): void {
		this.form.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			this.events.emit('form:submitSuccess');
		});
	}
}
