import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, MoreThan, Repository } from 'typeorm';
import { Order } from './entities/orders.entity';
import { getMatchingOrdersDTO } from './dto/getmatching.dto';
import { getOrdersDTO } from './dto/getorders.dto';
import { OrderStatus } from './enums';

@Injectable()
export class OrdersService {
  readonly orderRepository: Repository<Order>;

  constructor(private readonly dbConnection: DataSource) {
    this.orderRepository = this.dbConnection.getRepository(Order);
  }

  async getMatchingOrders(seachFields: getMatchingOrdersDTO): Promise<Order[]> {
    let result: Order[] = [];
    const where = {
      token_a: seachFields.tokenB.toLowerCase(),
      token_b: seachFields.tokenA.toLowerCase(),
      is_market: seachFields.isMarket,
      amount_a: MoreThan(seachFields.amountA),
      amount_b: MoreThan(seachFields.amountB),
      status: OrderStatus.active,
    };

    try {
      result = await this.orderRepository
        .createQueryBuilder('order')
        .where(where)
        .getMany();
    } catch (error) {
      console.error(error);
    }

    return result;
  }

  async getOrders(searchQuery: getOrdersDTO): Promise<Order[]> {
    let result: Order[] = [];
    let query = this.orderRepository.createQueryBuilder('order');

    if (searchQuery.user) {
      query = query.where(`order.user = '${searchQuery.user.toLowerCase()}'`);
    }

    if (searchQuery.tokenA && searchQuery.tokenB) {
      query = query.andWhere(
        new Brackets((qb) => {
          qb.where(
            `order.tokenA = '${searchQuery.tokenA.toLowerCase()}'`,
          ).orWhere(`order.tokenB = '${searchQuery.tokenB.toLowerCase()}'`);
        }),
      );
    } else {
      if (searchQuery.tokenA) {
        query = query.andWhere(
          `order.tokenB = '${searchQuery.tokenA.toLowerCase()}'`,
        );
      }
      if (searchQuery.tokenB) {
        query = query.andWhere(
          `order.tokenB = '${searchQuery.tokenB.toLowerCase()}'`,
        );
      }
    }
    try {
      result = await query
        .andWhere(`order.status = ${OrderStatus.active}`)
        .getMany();
    } catch (error) {
      console.error(error);
    }
    return result;
  }

  async getAllOrders(): Promise<Order[]> {
    let result: Order[] = [];
    try {
      result = await this.orderRepository.find();
    } catch (error) {
      console.error(error);
    }
    return result;
  }

  async getOrderById(id: number): Promise<Order> {
    let result: Order;
    try {
      result = await this.orderRepository.findOneBy({ id: id });
    } catch (error) {
      console.error(error);
    }
    return result;
  }

  async createOrder(order: Order): Promise<Order> {
    let result: Order;
    const repository = this.dbConnection.getRepository(Order);
    try {
      result = await repository.save(order);
    } catch (error) {
      console.error(error);
    }
    return result;
  }

  async updateOrder(order: Order) {
    try {
      await this.orderRepository
        .createQueryBuilder('order')
        .update(order)
        .where({
          id: order.id,
        })
        .execute();
    } catch (error) {
      console.error(error);
    }
  }
}
