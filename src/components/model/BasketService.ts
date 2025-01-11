import { IProduct } from '../../types/index';

export interface IBasketService {
	products: IProduct[];
	getProductCount(): number;
	getTotalPrice(): number;
	addProduct(product: IProduct): void;
	removeProduct(product: IProduct): void;
	clear(): void;
}

export class BasketService implements IBasketService {
	private _products: IProduct[];

	constructor() {
		this._products = [];
	}

	set products(data: IProduct[]) {
		this._products = data;
	}

	get products() {
		return this._products;
	}

	getProductCount(): number {
		return this.products.length;
	}

	getTotalPrice(): number {
		return this.products.reduce((total, product) => total + product.price, 0);
	}

	addProduct(product: IProduct): void {
		const isProductInBasket = this._products.some(p => p.id === product.id);
		if (!isProductInBasket) {
			this._products.push(product);
		}
	}

	removeProduct(product: IProduct): void {
		const index = this._products.indexOf(product);
		if (index >= 0) {
			this._products.splice(index, 1);
		}
	}

	clear(): void {
		this.products = [];
	}
}
