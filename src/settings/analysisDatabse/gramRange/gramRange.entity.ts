import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('mo_gram_range_setting')
export class GramRange {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  classId: string;

  @Column()
  rareBoundary: number;

  @Column()
  fewBoundary: number;

  @Column()
  moderateBoundary: number;

  @Column()
  fullNm: string;
}
