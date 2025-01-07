import { Api, ApiListResponse } from '../base/api';
import { IProduct } from '../../types/index';

export class ApiService extends Api {
	constructor(private cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
	}

	async getProductList(): Promise<ApiListResponse<IProduct>> {
		const data = await this.get<ApiListResponse<IProduct>>('/product');
		return {
			total: data.total,
			items: data.items.map(item => ({
				...item,
				image: this.resolveImageUrl(item.image),
			})),
		};
	}

	private resolveImageUrl(imagePath: string): string {
		return imagePath.startsWith('http') ? imagePath : `${this.cdn}${imagePath}`;
	}
}