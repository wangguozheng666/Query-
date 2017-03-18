/**
 * 为了防止变量以及全局对象的污染，引用沙箱模式
 */
(function(global){
  var document=global.document,
      arr=[],
      push=arr.push,
      slice=arr.slice;
  function itcast(selector) {
    return new itcast.fn.init(selector);
  };
  //工能类方法
  itcast.fn=itcast.prototype={
    constructor:itcast,
    length:0,//由于itcast对象是伪数组对象，默认length属性值为0，
  toArray:function(){
    return slice.call(this);
  },
  get:function(index){
    if(index==null){
      return this.toArray();
    }
    return this[index<0?this.length+index:index];
  },
    eq:function (index) {
      return itcast(this[index<0?this.length+index:index]);
    },
    first:function () {
      return this.eq(0);
    },
    last:function(){
      return this.eq(-1);
    },
    each:function (callback) {
      itcast.each(this,callback);
      return this;
    },
    splice:arr.splice
  };
  var init=itcast.fn.init=function (selector) {
    if(!selector){
      return this;

    }else if(itcast.isString(selector)){
      if(itcast.isHTML(selector)){
        push.apply(this,itcast.parseHTML(selector));
      }else{
        push.apply(this,document.querySelectorAll(selector));
      }
    }else if(itcast.isDOM(selector)){
      this[0]=selector;
      this.length=1;
    }else if(itcast.isArrayLike(selector)){
      push.apply(this,selector);
    }else if(itcast.isFunction(selector)){
      document.addEventListener('DOMContentLoaded',function () {
          selector();
      });
    }
  };
  init.prototype=itcast.fn;
  //封装extend方法
  itcast.extend=itcast.fn.extend=function(){
    var args=arguments,
        i=0,
        l=args.length,
        obj,
        k;
    for(;i<l;i++){
      obj=args[i];
      for (k in obj) {
        if(obj.hasOwnProperty(k)){
          this[k]=obj[k];
        }
      }
    }
  return this;
  };
  //工具类方法
  itcast.extend({
    each:function (obj,callback) {
      var i=0,
          l;
      //如果obj为数组或伪数组
      if(itcast.isArrayLike(obj)){
        l=obj.length;
        //使用for循环遍历数组或伪数组
        for (; i < l; i++) {
          //执行指定的回调函数callback，改变内this值为当前遍历到的元素同时传入i和obj[i]
          //判断回调函数callback的返回值，如果为诶false结束循环
          if(callback.call(obj[i],i,obj[i])===false){
            break;
          }
        }
        //如果obj是普通对象
      }else {
        for(i in obj){
          if(callback.call(obj[i],i,obj[i])===false ){
            break;
          }
        }
      }
      return obj;
    },
    type:function (obj) {
      if(obj==null){
        return obj+'';
      }
      return typeof obj !=='object'?typeof obj:
          Object.prototype.toString.call(obj).slice(8,-1).toLowerCase();
    },
    parseHTML:function (html) {
      var div=document.createElement('div'),
          node,
          ret=[];
      div.innerHTML=html;
      for (node=div.firstChild;node;node=node.nextSibling) {
          if(node.nodeType===1){
            ret.push(node);
          }
      }
      return ret;
    }
  });
  //工具类方法——类型判断方法
  itcast.extend({
    isString:function (obj) {
      return typeof obj==='string';
    },
    isHTML:function (obj) {
      obj=obj+'';
      return obj[0]==='<'&&obj[obj.length-1]==='>'&&obj.length>=3;
    },
    isDOM:function (obj) {
      return !!obj&&!!obj.nodeType;
    },
    isArrayLike:function (obj) {
      var length=!!obj&&'length' in obj&&obj.length,
          type=itcast.type(obj);
      if(type==='function'||itcast.isWindow(obj)){
        return false ;
      }
      return type==='array'||length===0||
              typeof length==='number'&&length>0&&(length-1)in obj;
    },
    isFunction:function (obj) {
      return typeof obj==='function';
    },
    isWindow:function (obj) {
      return !!obj&&obj.window===obj;
    }
  });
  //dom操作模块
  itcast.fn.extend({
    appendTo:function(target){
      var that=this,
          ret=[],
          node;
      //统一target类型，为itcast对象
      target=itcast(target);
      //遍历target
      target.each(function (i,elem) {
        //遍历itcast对象-----appendTo方法的调用者（要添加的元素）
        that.each(function () {
          //判断当前目标元素是否为第一个元素，如果是，不需要拷贝源节点，否则就要深拷贝源节点
          node = i === 0 ? this: this.cloneNode(true);
          //将上述得到的节点，添加到ret数组对象中保存
          ret.push(node);
          //将新节点追加到目标dom元素下
          elem.appendChild(node);
        })
      })
      return itcast(ret);
    },
    append:function (source) {
      //将source转换成itcast对象
      source=itcast(source);
      //使用source调用appendTo方法，将this作为目标元素传入appendTo方法
      source.appendTo(this);
      return this;
    },
    prependTo:function (target) {
      var that=this,
          ret=[],
          node;
      //统一target类型，为itcast对象
      target=itcast(target);
      //遍历target对象
      target.each(function (i,elem) {
        //遍历prependTo方法的调用者
        firstChild=elem.firstChild;
        that.each(function () {
          node = i === 0 ? this:this.cloneNode( true );
          ret.push( node );
          elem.insertBefore(node,firstChild);
        })
      })
      return itcast(ret);
    },
    prepend:function (source) {
      source=itcast(source);
      source.prependTo(this);
      return this;
    }

  });
  //兼容模块式开发
  if(typeof define==='function'){
    define(function () {
      return itcast;
    } );
  }else if(typeof exports!=='undefined'){
    module.exports=itcast;
  }else{
    global.$=itcast;
  }
}(window));