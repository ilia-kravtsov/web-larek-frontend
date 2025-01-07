import { IProduct } from '../../types/index';
import { IEvents } from '../base/events';

export interface IDataService {
	products: IProduct[];
}

export class DataService implements IDataService {
	protected _products: IProduct[];
	product: IProduct;

	constructor(protected events: IEvents) {
		this._products = [];
	}

	set products(data: IProduct[]) {
		this._products = data;
		this.events.emit('products:received');
	}

	get products(): IProduct[] {
		return this._products;
	}

	modalWindowProduct (item: IProduct) {
		this.product = item;
		this.events.emit('modalWindow:open', item)
	}
}