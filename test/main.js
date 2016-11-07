/*!
 * 
 * Author: CheMingjun
 */

require('./../index').addExtention({
    name: 'ext0', path: './test/test:ext0'
}).addJunction({
    from: './test/test:service', to: 'ext0'
}).addJunction({
    from: './test/test:invokeB', to: 'invokeBefore'
})

require('./test').test();