import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('mo_gram_range_setting')
export class GramRange {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  classId: string;

  @Column()
  rareMost: string;

  @Column()
  fewLeast: string;

  @Column()
  fewMost: string;

  @Column()
  moderateLeast: string;

  @Column()
  moderateMost: string;

  @Column()
  manyLeast: string;

  @Column()
  abbreviation: string;

  @Column()
  fullNm: string;

  @Column()
  unit: string;
}
