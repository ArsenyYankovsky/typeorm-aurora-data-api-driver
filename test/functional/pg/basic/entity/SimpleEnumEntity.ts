import { Column, Entity, PrimaryColumn } from 'typeorm'

export enum NumericEnum {
  ADMIN,
  EDITOR,
  MODERATOR,
  GHOST
}

export enum StringEnum {
  ADMIN = 'a',
  EDITOR = 'e',
  MODERATOR = 'm',
  GHOST = 'g'
}

export enum StringNumericEnum {
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4'
}

export enum HeterogeneousEnum {
  NO = 0,
  YES = 'YES',
}

export type ArrayDefinedStringEnumType = 'admin' | 'editor' | 'ghost'

export type ArrayDefinedNumericEnumType = 11 | 12 | 13


@Entity()
export class SimpleEnumEntity {
  @PrimaryColumn()
  public id!: number

  @Column({
    type: 'enum',
    enum: NumericEnum,
    default: NumericEnum.MODERATOR,
  })
  public numericEnum!: NumericEnum

  @Column({
    type: 'simple-enum',
    enum: NumericEnum,
    default: NumericEnum.MODERATOR,
  })
  public numericSimpleEnum!: NumericEnum

  @Column({
    type: 'simple-enum',
    enum: StringEnum,
    default: StringEnum.GHOST,
  })
  public stringEnum!: StringEnum

  @Column({
    type: 'simple-enum',
    enum: StringNumericEnum,
    default: StringNumericEnum.FOUR,
  })
  public stringNumericEnum!: StringNumericEnum

  @Column({
    type: 'simple-enum',
    enum: HeterogeneousEnum,
    default: HeterogeneousEnum.NO,
  })
  public heterogeneousEnum!: HeterogeneousEnum

  @Column({
    type: 'simple-enum',
    enum: ['admin', 'editor', 'ghost'],
    default: 'ghost',
  })
  public arrayDefinedStringEnum!: ArrayDefinedStringEnumType

  @Column({
    type: 'simple-enum',
    enum: [11, 12, 13],
    default: 12,
  })
  public arrayDefinedNumericEnum!: ArrayDefinedNumericEnumType

  @Column({
    type: 'simple-enum',
    enum: StringEnum,
  })
  public enumWithoutdefault!: StringEnum
}
