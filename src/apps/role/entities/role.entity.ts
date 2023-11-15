import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryColumn({ unique: true })
  id: number;

  @Column({ unique: true })
  name: string;
}
