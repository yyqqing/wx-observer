/* @flow */

import { warn } from './debug'

export function handleError (err: Error, vm: any, info: string) {
  console.log('handleError :: ', err, vm, info)
}
