import { Database, DatabaseEventsMap } from '../db/Database';
export declare type DatabaseMessageEventData = {
    operationType: 'create';
    payload: Parameters<DatabaseEventsMap['create']>;
} | {
    operationType: 'update';
    payload: Parameters<DatabaseEventsMap['update']>;
} | {
    operationType: 'delete';
    payload: Parameters<DatabaseEventsMap['delete']>;
};
/**
 * Synchronizes database operations across multiple clients.
 */
export declare function sync(db: Database<any>): void;
