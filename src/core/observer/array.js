/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

 /**
  * 定义 arrayMethods 对象，用于增强 Array.prototype
  * 当访问 arrayMethods 对象上的那七个方法时会被拦截，以实现数组响应式
  */

import { def } from '../util/index'

// 备份 数组 原型对象
const arrayProto = Array.prototype
// 使用数组的原型创建一个新的对象
// 通过继承的方式创建新的 arrayMethods
export const arrayMethods = Object.create(arrayProto)
// 修改数组元素的方法
// 操作数组的七个方法，这七个方法可以改变数组自身
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
/**
 * 拦截变异方法并触发事件
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 保存数组原方法
  // 缓存原生方法，比如 push
  const original = arrayProto[method]
  // 调用 Object.defineProperty() 重新定义修改数组的方法
  def(arrayMethods, method, function mutator (...args) {
    // 执行数组的原始方法
    const result = original.apply(this, args)
    // 获取数组对象的 ob 对象
    const ob = this.__ob__
    // 如果 method 是以下三个之一，说明是新插入了元素
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 对插入的新元素，重新遍历数组元素设置为响应式数据
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 调用了修改数组的方法，调用数组的ob对象发送通知
    ob.dep.notify()
    return result
  })
})
