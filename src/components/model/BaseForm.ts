import { getElementOrLogError } from '../../utils/utils';
import { IEvents } from '../base/events';

export abstract class BaseForm {
	form: HTMLFormElement;
	inputAll: HTMLInputElement[] = [];
	buttons: HTMLButtonElement[] = [];
	submitButton: HTMLButtonElement;
	formErrors: HTMLElement;

	constructor(template: HTMLTemplateElement, protected events: IEvents) {
		// Общая логика для получения формы и ее элементов
		this.form = template.content.querySelector('.form').cloneNode(true) as HTMLFormElement;
		this.inputAll = Array.from(this.form.querySelectorAll('.form__input'));
		this.buttons = Array.from(this.form.querySelectorAll('.button_alt'));
		this.submitButton = getElementOrLogError<HTMLButtonElement>('.button', this.form);
		this.formErrors = getElementOrLogError<HTMLElement>('.form__errors', this.form);
	}
}


