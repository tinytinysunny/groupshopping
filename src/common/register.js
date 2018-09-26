
import uuid from 'uuid'

var __instance = (function () {
  var instance
  return (newInstance) => {
    if (newInstance) instance = newInstance
    return instance
  }
}())

var prefix = function(str){
  return 'ymt-' + str
}

var createMountPoint = function() {
  var container = $('<div></div>')
  var idstr = prefix(uuid.v4())
  container.attr('id', idstr)

  $('body').append(container)
  // $('#evt-content').append(mt)

  return idstr
}

class Register {
  constructor () {
    if (__instance()) return __instance()
    __instance(this)
  }

  add (vueComponent, data) {
    var mtid = createMountPoint()
    var VM = Vue.extend(vueComponent)

    new VM({
      el:`#${mtid}`,
			propsData:data
    })
  }
}

export default new Register()
