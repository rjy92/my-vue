import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
// 此处不用 class 的原因是因为方便后续给 Vue 实例混入实例成员
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用 Vue.prototype._init 方法，该方法是在 initMixin 中定义的
  this._init(options)
}
// 注册 vm 的 _init() 方法，初始化 vm
initMixin(Vue)
// 注册 vm 的 $data/$props/$set/$delete/$watch
/**
 * 定义：
 *   Vue.prototype.$data
 *   Vue.prototype.$props
 *   Vue.prototype.$set
 *   Vue.prototype.$delete
 *   Vue.prototype.$watch
 */
stateMixin(Vue)


// 初始化事件相关方法
// $on/$once/$off/$emit
/**
 * 定义 事件相关的 方法：
 *   Vue.prototype.$on
 *   Vue.prototype.$once
 *   Vue.prototype.$off
 *   Vue.prototype.$emit
 */
eventsMixin(Vue)


// 初始化生命周期相关的混入方法
// _update/$forceUpdate/$destroy
/**
 * 定义：
 *   Vue.prototype._update
 *   Vue.prototype.$forceUpdate
 *   Vue.prototype.$destroy
 */
lifecycleMixin(Vue)
// 混入 render
// $nextTick/_render
/**
 * 执行 installRenderHelpers，在 Vue.prototype 对象上安装运行时便利程序
 * 
 * 定义：
 *   Vue.prototype.$nextTick
 *   Vue.prototype._render
 */
renderMixin(Vue)

export default Vue
