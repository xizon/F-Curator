/**
 * Array deduplication check
 */

 import { isEqual } from 'lodash';

export default function uniqueArr(arr) {
    const cleaned = [];
    arr.forEach(function(item) {
        let unique = true;
        cleaned.forEach(function(item2) {
            if (isEqual(item, item2)) unique = false;
        });
        if (unique) {
            cleaned.push(item as never);
        }
    });
    return cleaned;
}