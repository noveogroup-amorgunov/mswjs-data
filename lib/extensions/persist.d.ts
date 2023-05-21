import { FactoryAPI } from '../glossary';
declare type ExtensionOption = {
    storage?: Pick<Storage, 'getItem' | 'setItem'>;
    keyPrefix?: string;
};
/**
 * Persist database in session storage
 */
export declare function persist(factory: FactoryAPI<any>, options?: ExtensionOption): void;
export {};
