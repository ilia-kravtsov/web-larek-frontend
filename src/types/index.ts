// Api interfaces

export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: TProductCategory;
	price: number | null;
}

export interface IProductList {
	total: number;
	items: IProduct[];
}

export interface IOrderSuccess {
	id: string;
	total: number;
}

export interface IError {
	error: string;
}

export interface IOrderRequest {
	payment: string,
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

// Additional interfaces

export type TProductCategory =
	| 'софт-скил'
	| 'другое'
	| 'дополнительное'
	| 'кнопка'
	| 'хард-скил';

export interface IActions {
	onClick: (event: MouseEvent) => void;
}

export type OrderError = Record<string, string>

export type PaymentMethod = 'cash' | 'card'

export type EventName = 'renderSuccessWindow:close' | 'modal:open' | 'modal:close';

export type EventHandler = () => void;
