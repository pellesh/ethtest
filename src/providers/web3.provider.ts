import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { Injectable } from '@nestjs/common';
import { Abi } from '../config/contractabi';
import { Order } from 'src/orders/entities/orders.entity';
import { OrdersService } from 'src/orders/orders.service';
import { OrderStatus } from 'src/orders/enums';
import { shallowEqual } from '../utils/utils';
import dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../../.env' });

@Injectable()
export class Web3Sevice {
  readonly ethNetwork: string = process.env.ETH_NETWORK;
  readonly ethContractAddress: string = process.env.ETH_CONTRACT_ADDRESS;
  private contract: Contract;

  constructor(private readonly orderService: OrdersService) {
    this.initContractConnection();
    this.syncOrders();
    this.addListeners();
  }

  private addListeners() {
    this.contract.events.OrderCreated({}, async (err, res) => {
      if (res.returnValues) {
        const order: Order = {
          id: res.returnValues.id,
          amount_a: res.returnValues.amountA,
          amount_b: res.returnValues.amountB,
          token_a: res.returnValues.tokenA.toLowerCase(),
          token_b: res.returnValues.tokenB.toLowerCase(),
          user: res.returnValues.user.toLowerCase(),
          is_market: res.returnValues.isMarket,
          status: 0,
          fees: 0,
          amount_left_to_fill: 0,
        };
        this.orderService.createOrder(order);
      }
    });

    this.contract.events.OrderMatched({}, async (err: Error, res: any) => {
      console.log('OrderMatched');
      console.log(res);
      if (res.returnValues) {
        const order = await this.orderService.getOrderById(
          +res.returnValues.id,
        );
        if (order.amount_a === +res.returnValues.amountLeftToFill) {
          order.status = OrderStatus.complete;
        }
        order.amount_left_to_fill = +res.returnValues.amountLeftToFill;
        await this.orderService.updateOrder(order);
      }
    });

    this.contract.events.OrderCancelled({}, async (err: Error, res: any) => {
      console.log('OrderCancelled');
      console.log(res);
      if (res.returnValues) {
        const order = await this.orderService.getOrderById(
          +res.returnValues.id,
        );
        order.status = OrderStatus.cancelled;
        await this.orderService.updateOrder(order);
      }
    });
  }

  private async syncOrders(): Promise<boolean> {
    console.log('Synchronizing orders after restart node....');
    const dbOrdersMap = {};
    let itemsCount = 0;
    console.log('Retrieving orders from db...');
    const dbOrders: Order[] = await this.orderService.getAllOrders();
    console.log(`Retrieved orders: ${dbOrders.length}`);

    dbOrders.forEach((item) => {
      dbOrdersMap[item.id] = item;
    });

    const ethIds: string[] = [];
    console.log('Retrieving transactions count from contract...');
    try {
      itemsCount = await this.contract.methods.getOrderIdLength().call();
    } catch (error) {
      console.error(error);
      return false;
    }

    console.log(`Transactions in contract: ${itemsCount}`);
    for (let i = 0; i < itemsCount; i++) {
      let id: string;
      try {
        id = await this.contract.methods.getOrderId(i).call();
      } catch (error) {
        console.error(error);
        return false;
      }

      console.log(`Transactions id: ${id}`);
      ethIds.push(id);
    }

    console.log('Retrieving transactions info from contract...');
    for (let i = 0; i < ethIds.length; i++) {
      let order: any;
      try {
        order = await this.contract.methods.getOrderInfo(ethIds[i]).call();
      } catch (error) {
        console.error(error);
        return false;
      }

      const formattedforDbOrder = {
        id: order['0'],
        amount_a: order['1'],
        amount_b: order['2'],
        amount_left_to_fill: order['3'],
        fees: order['4'],
        token_a: order['5'].toLowerCase(),
        token_b: order['6'].toLowerCase(),
        user: order['7'].toLowerCase(),
        status: +order['1'] === +order['3'] ? 2 : +order['8'],
        is_market: !(order['1'] && order['2']),
      };

      if (!dbOrdersMap[ethIds[i]]) {
        console.log(`Founded new transaction with id: ${ethIds[i]}`);
        await this.orderService.createOrder(formattedforDbOrder);
      } else {
        if (
          !shallowEqual(formattedforDbOrder, dbOrdersMap[ethIds[i]], ['uuid'])
        ) {
          console.log(`Updating transaction with id: ${ethIds[i]}`);
          await this.orderService.updateOrder(formattedforDbOrder);
        }
      }
    }
    console.log('Sinchronize complete');
    return true;
  }

  private initContractConnection() {
    const web3 = new Web3(this.ethNetwork);
    this.contract = new web3.eth.Contract(
      Abi as AbiItem[],
      this.ethContractAddress,
    );
  }
}
