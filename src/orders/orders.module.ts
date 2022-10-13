import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Web3Sevice } from 'src/providers/web3.provider';
import { dataSource } from 'src/config/datasource';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(dataSource)],
  controllers: [OrdersController],
  providers: [OrdersService, Web3Sevice],
})
export class OrdersModule {}
