import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Order } from './entities/orders.entity';
import { getMatchingOrdersDTO } from './dto/getmatching.dto';
import { getOrdersDTO } from './dto/getorders.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Match orders' })
  @ApiParam({
    name: 'isMarket',
    type: 'boolean',
    required: true,
    description: 'Is order is market or limit',
  })
  @ApiParam({
    name: 'amountB',
    type: 'number',
    required: true,
    description: 'Tokens to sell amount',
  })
  @ApiParam({
    name: 'amountA',
    type: 'number',
    required: true,
    description: 'Tokens to buy amount',
  })
  @ApiParam({
    name: 'tokenB',
    type: 'string',
    required: true,
    description: 'Token to sell address',
  })
  @ApiParam({
    name: 'tokenA',
    type: 'string',
    required: true,
    description: 'Token to buy address',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: [Order] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Get('getMatchingOrders')
  async getMatchingOrders(
    @Query() seachFields: getMatchingOrdersDTO,
  ): Promise<Order[]> {
    return await this.ordersService.getMatchingOrders(seachFields);
  }

  @ApiOperation({ summary: 'Search active orders' })
  @ApiParam({
    name: 'user',
    type: 'string',
    required: false,
    description: 'User created order',
  })
  @ApiParam({
    name: 'tokenB',
    type: 'string',
    required: false,
    description: 'Token to sell address',
  })
  @ApiParam({
    name: 'tokenA',
    type: 'string',
    required: false,
    description: 'Token to buy address',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: [Order] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Get('getOrders')
  getOrders(@Query() seachFields: getOrdersDTO): Promise<Order[]> {
    return this.ordersService.getOrders(seachFields);
  }
}
