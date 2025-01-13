import { IEvents } from '../base/events';
import { IOrderRequest, OrderError } from '../../types/index';

export interface IOrderServiceMethods {
	setAddress(field: string, value: string): void;
	validateOrder(): boolean;
	setContactData(field: string, value: string): void;
	validateContacts(): boolean;
	updateOrderData(): object;
}

export class OrderService implements IOrderServiceMethods, IOrderRequest {
	payment = '';
	email = '';
	phone = '';
	address = '';
	total = 0;
	items: string[] = [];
	errors: OrderError = {};

	constructor(protected events: IEvents) {}

	setAddress(field: string, value: string) {
		if (field === 'address') {
			this.address = value;
		}

		if (this.validateOrder()) {
			this.events.emit('order:completed', this.updateOrderData());
		}
	}

	validateOrder() {
		const errors: OrderError = {};

		if (!this.address) {
			errors.address = 'Address is required';
		} else if (!this.isValidAddress(this.address)) {
			errors.address = 'Please provide a valid address';
		}

		if (!this.payment) {
			errors.payment = 'Payment method is required';
		} else if (!this.isValidPayment(this.payment)) {
			errors.payment = 'Invalid payment method';
		}

		this.errors = errors;
		const isValid = this.isFormValid(errors);
		this.events.emit('orderForm:update', { isValid, errors });

		return isValid;
	}

	private isValidPayment(payment: string): boolean {
		const validPayments = ['cash', 'card'];
		return validPayments.includes(payment);
	}

	private isValidAddress(address: string): boolean {
		const addressRegex = /^[а-яА-ЯёЁa-zA-Z0-9\s/.,-]{7,}$/;
		return addressRegex.test(address);
	}

	private isFormValid(errors: OrderError): boolean {
		return Object.keys(errors).length === 0;
	}

	setContactData(field: string, value: string) {
		if (field === 'email') {
			this.email = value;
		} else if (field === 'phone') {
			this.phone = value;
		}

		if (this.validateContacts()) {
			this.events.emit('order:completed', this.updateOrderData());
		}
	}

	validateContacts() {
		const errors: OrderError = {};

		this.validateEmail(errors);
		this.validatePhone(errors);

		this.errors = errors;
		this.events.emit('orderError:isValid', this.errors);

		return this.isFormValid(errors);
	}

	private validateEmail(errors: OrderError) {
		const emailRegex = /^(?![.-])[A-Za-z0-9._%+-]+(?:[A-Za-z0-9.-]*[A-Za-z0-9])?@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

		if (!this.email) {
			errors.email = 'Email is required';
		} else if (!emailRegex.test(this.email)) {
			errors.email = 'Invalid email address';
		}
	}

	private validatePhone(errors: OrderError) {
		const phoneRegex = /^(?:\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

		if (this.phone && this.phone[0] === '8') {
			this.phone = `+7${this.phone.slice(1)}`;
		}

		if (!this.phone) {
			errors.phone = 'Phone number is required';
		} else if (!phoneRegex.test(this.phone)) {
			errors.phone = 'Invalid phone number format';
		}
	}

	updateOrderData() {
		return {
			payment: this.payment,
			email: this.email,
			phone: this.phone,
			address: this.address,
			total: this.total,
			items: this.items,
		};
	}
}
