/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheriance and cache them.
   */
  Vue.cid = 0
  let cid = 1

  /**
   * 基于 Vue 去扩展子类，该子类同样支持进一步的扩展
   * 扩展时可以传递一些默认配置，就像 Vue 也会有一些默认配置
   * 默认配置如果和基类有冲突则会进行选项合并（mergeOptions)
   */

  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    // Vue 构造函数
    const Super = this
    const SuperId = Super.cid
    /**
     * 利用缓存，如果存在则直接返回缓存中的构造函数
     * 什么情况下可以利用到这个缓存？
     *   如果你在多次调用 Vue.extend 时使用了同一个配置项（extendOptions），这时就会启用该缓存
     */

    // 从缓存中加载组件的构造函数
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      // 如果是开发环境验证组件的名称
      validateComponentName(name)
    }

    // 定义 Sub 构造函数，和 Vue 构造函数一样
    const Sub = function VueComponent (options) {
      // 调用 _init() 初始化
      this._init(options)
    }
    // 原型继承自 Vue
    // 通过原型继承的方式继承 Vue
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    // 选项合并options，合并 Vue 的配置项到 自己的配置项上来
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // 初始化 props，将 props 配置代理到 Sub.prototype._props 对象上
    // 在组件内通过 this._props 方式可以访问
    if (Sub.options.props) {
      initProps(Sub)
    }
    // 初始化 computed，将 computed 配置代理到 Sub.prototype 对象上
    // 在组件内可以通过 this.computedKey 的方式访问

    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    // 定义 extend、mixin、use 这三个静态方法，允许在 Sub 基础上再进一步构造子类
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    // 定义 component、filter、directive 三个静态方法
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    // 把组件构造构造函数保存到 Ctor.options.components.comp = Ctor
    // 递归组件的原理，如果组件设置了 name 属性，则将自己注册到自己的 components 选项中
    if (name) {
      Sub.options.components[name] = Sub
    }

    // 在扩展时保留对基类选项的引用。
    // 稍后在实例化时，我们可以检查 Super 的选项是否具有更新
    
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    // 把组件的构造函数缓存到 options._Ctor
    cachedCtors[SuperId] = Sub
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
