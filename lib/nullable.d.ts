import { ModelValueType } from './glossary';
import { ManyOf, OneOf, Relation, RelationKind } from './relations/Relation';
export declare type NullableGetter<ValueType extends ModelValueType> = () => ValueType | null;
export declare class NullableProperty<ValueType extends ModelValueType> {
    getValue: NullableGetter<ValueType>;
    constructor(getter: NullableGetter<ValueType>);
}
export declare function nullable<ValueType extends ModelValueType>(value: NullableGetter<ValueType>): NullableProperty<ValueType>;
export declare function nullable<ValueType extends Relation<any, any, any, {
    nullable: false;
}>>(value: ValueType): ValueType extends Relation<infer Kind, infer Key, any, {
    nullable: false;
}> ? Kind extends RelationKind.ManyOf ? ManyOf<Key, true> : OneOf<Key, true> : never;
