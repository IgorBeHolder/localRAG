(function(global,factory){if('function'==typeof define&&define.amd)define(['exports','react','prop-types','./styled-elements'],factory);else if('undefined'!=typeof exports)factory(exports,require('react'),require('prop-types'),require('./styled-elements'));else{var mod={exports:{}};factory(mod.exports,global.React,global.propTypes,global.styledElements),global.index=mod.exports}})(this,function(exports,_react,_propTypes,_styledElements){'use strict';function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError('Cannot call a class as a function')}function _possibleConstructorReturn(self,call){if(!self)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return call&&('object'==typeof call||'function'==typeof call)?call:self}function _inherits(subClass,superClass){if('function'!=typeof superClass&&null!==superClass)throw new TypeError('Super expression must either be null or a function, not '+typeof superClass);subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:!1,writable:!0,configurable:!0}}),superClass&&(Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass)}Object.defineProperty(exports,'__esModule',{value:!0});var _class,_temp2,_react2=_interopRequireDefault(_react),_propTypes2=_interopRequireDefault(_propTypes),_extends=Object.assign||function(target){for(var source,i=1;i<arguments.length;i++)for(var key in source=arguments[i],source)Object.prototype.hasOwnProperty.call(source,key)&&(target[key]=source[key]);return target},_createClass=function(){function defineProperties(target,props){for(var descriptor,i=0;i<props.length;i++)descriptor=props[i],descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,'value'in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}return function(Constructor,protoProps,staticProps){return protoProps&&defineProperties(Constructor.prototype,protoProps),staticProps&&defineProperties(Constructor,staticProps),Constructor}}(),Bar=(_temp2=_class=function(_Component){function Bar(){var _ref,_temp,_this,_ret;_classCallCheck(this,Bar);for(var _len=arguments.length,args=Array(_len),_key=0;_key<_len;_key++)args[_key]=arguments[_key];return _ret=(_temp=(_this=_possibleConstructorReturn(this,(_ref=Bar.__proto__||Object.getPrototypeOf(Bar)).call.apply(_ref,[this].concat(args))),_this),_this.handleClose=function(){_this.props.handleClose?_this.props.handleClose(_this.context.toggleShow):_this.context.toggleShow()},_this.handleMinimise=function(){_this.props.handleMinimise?_this.props.handleMinimise(_this.context.toggleMinimize):_this.context.toggleMinimize()},_this.handleMaximise=function(){_this.props.handleMaximise?_this.props.handleMaximise(_this.context.toggleMaximise):_this.context.toggleMaximise()},_temp),_possibleConstructorReturn(_this,_ret)}return _inherits(Bar,_Component),_createClass(Bar,[{key:'render',value:function(){var _props=this.props,style=_props.style,showActions=_props.showActions;return _react2.default.createElement(_styledElements.TerminalTopBar,{style:_extends({},style,this.context.maximise?{maxWidth:'100%'}:{})},showActions&&_react2.default.createElement('svg',{height:'20',width:'100'},_react2.default.createElement('circle',{cx:'24',cy:'14',r:'5',fill:'red',style:{cursor:'pointer'},onClick:this.handleClose}),_react2.default.createElement('circle',{cx:'44',cy:'14',r:'5',fill:'orange',style:{cursor:'pointer'},onClick:this.handleMinimise}),_react2.default.createElement('circle',{cx:'64',cy:'14',r:'5',fill:'green',style:{cursor:'pointer'},onClick:this.handleMaximise})))}}]),Bar}(_react.Component),_class.displayName='Bar',_class.propTypes={style:_propTypes2.default.object,showActions:_propTypes2.default.bool,handleMinimise:_propTypes2.default.func,handleMaximise:_propTypes2.default.func,handleClose:_propTypes2.default.func},_class.defaultProps={style:{},showActions:!0},_class.contextTypes={maximise:_propTypes2.default.bool,toggleShow:_propTypes2.default.func,toggleMinimize:_propTypes2.default.func,toggleMaximise:_propTypes2.default.func},_temp2);exports.default=Bar});
//# sourceMappingURL=index.js.map