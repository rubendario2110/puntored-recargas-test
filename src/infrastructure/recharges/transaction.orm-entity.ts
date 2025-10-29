import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 10 })
  phoneNumber!: string;

  @Column({ type: 'integer' })
  amount!: number;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
