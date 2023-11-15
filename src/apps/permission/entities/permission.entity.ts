import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryColumn({ unique: true })
  id: number;

  @Column({ unique: true })
  name: string;
}
