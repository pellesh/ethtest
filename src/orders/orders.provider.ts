import { DataSource } from 'typeorm';
import { Order } from './entities/orders.entity';

export const ordersProvider = [
  {
    provide: 'ORDERS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Order),
    inject: ['DATA_SOURCE'],
  },
];
