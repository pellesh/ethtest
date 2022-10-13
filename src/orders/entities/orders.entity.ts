import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Order {
  @ApiProperty({ description: 'Order UUID', nullable: false })
  @PrimaryGeneratedColumn('uuid')
  uuid?: string;

  @ApiProperty({ description: 'ID at smart contract', nullable: false })
  @Column({ type: 'numeric' })
  id: number;

  @ApiProperty({ description: 'Token to buy address', nullable: false })
  @Column({ type: 'varchar', length: 100 })
  token_a: string;

  @ApiProperty({ description: 'Token to sell address', nullable: false })
  @Column({ type: 'varchar', length: 100 })
  token_b: string;

  @ApiProperty({ description: 'Tokens to buy amount', nullable: false })
  @Column({ type: 'numeric' })
  amount_a: number;

  @ApiProperty({ description: 'Tokens to sell amount', nullable: false })
  @Column({ type: 'numeric' })
  amount_b: number;

  @ApiProperty({
    description: 'Status of order. 0 = active, 1 = cancelled, 2 = completed',
    nullable: false,
  })
  @Column({ type: 'int' })
  status: number;

  @ApiProperty({ description: 'Amount of recieved tokens', nullable: false })
  @Column({ type: 'numeric' })
  amount_left_to_fill: number;

  @ApiProperty({ description: 'Amount of fee', nullable: false })
  @Column({ type: 'numeric' })
  fees: number;

  @ApiProperty({ description: 'Is market or limit order', nullable: false })
  @Column({ type: 'boolean' })
  is_market: boolean;

  @ApiProperty({ description: 'User created order', nullable: false })
  @Column({ type: 'varchar', length: 100 })
  user: string;
}
