(this.webpackJsonpreactfront=this.webpackJsonpreactfront||[]).push([[0],{31:function(t){t.exports=JSON.parse('{"buttons":[{"pin":{"test_stand":"ETH","labjack_pin":14,"name":"Main Fuel (Ethanol) Valve","abbrev":"main"},"position":{"width":2,"height":1,"x":11.5,"y":15}},{"pin":{"test_stand":"ETH","labjack_pin":12,"name":"Fuel (Ethanol) Fill Valve","abbrev":"fill"},"position":{"width":2,"height":1,"x":8,"y":13}},{"pin":{"test_stand":"ETH","labjack_pin":10,"name":"Fuel (Ethanol) Dump/Drain Valve","abbrev":"drain"},"position":{"width":2,"height":1,"x":4,"y":13}},{"pin":{"test_stand":"ETH","labjack_pin":8,"name":"Fuel (Ethanol) Tank Nitrogen Pressurisation Valve","abbrev":"pres"},"position":{"width":2,"height":1,"x":8,"y":4}},{"pin":{"test_stand":"ETH","labjack_pin":19,"name":"Fuel (Ethanol) Tank Vent Valve","abbrev":"vent"},"position":{"width":2,"height":1,"x":11,"y":1}},{"pin":{"test_stand":"ETH","labjack_pin":17,"name":"Fuel (Ethanol) Line Nitrogen Purge Valve","abbrev":"purge"},"position":{"width":2,"height":1,"x":8,"y":17}},{"pin":{"test_stand":"LOX","labjack_pin":16,"name":"Main Oxidiser (LOX) Valve","abbrev":"main"},"position":{"width":2,"height":1,"x":17.5,"y":15}},{"pin":{"test_stand":"LOX","labjack_pin":18,"name":"Oxidiser (LOX) Fill Valve","abbrev":"fill"},"position":{"width":2,"height":1,"x":21,"y":13}},{"pin":{"test_stand":"LOX","labjack_pin":9,"name":"Oxidiser (LOX) Dump/Drain Valve","abbrev":"drain"},"position":{"width":2,"height":1,"x":25,"y":13}},{"pin":{"test_stand":"LOX","labjack_pin":11,"name":"Oxidiser (LOX) Tank Nitrogen Pressurisation Valve","abbrev":"pres"},"position":{"width":2,"height":1,"x":21,"y":4}},{"pin":{"test_stand":"LOX","labjack_pin":13,"name":"Oxidiser (LOX) Tank Vent Valve","abbrev":"vent"},"position":{"width":2,"height":1,"x":18,"y":1}},{"pin":{"test_stand":"LOX","labjack_pin":15,"name":"Oxidiser (LOX) Line Nitrogen Purge Valve","abbrev":"purge"},"position":{"width":2,"height":1,"x":21,"y":17}}],"sensors":[{"pin":{"test_stand":"LOX","labjack_pin":1,"sensorNumber":0,"name":"LOX Nitrogen Pressurant Sensor","abbrev":"lox_n2"},"position":{"width":5,"height":3,"x":25,"y":3}},{"pin":{"test_stand":"LOX","labjack_pin":3,"sensorNumber":1,"name":"LOX Tank Pressure Sensor","abbrev":"lox_tank"},"position":{"width":3,"height":4.5,"x":17,"y":7.5}},{"pin":{"test_stand":"ETH","labjack_pin":1,"sensorNumber":2,"name":"Ethanol Nitrogen Pressurant Sensor","abbrev":"eth_n2"},"position":{"width":5,"height":3,"x":1,"y":3}},{"pin":{"test_stand":"ETH","labjack_pin":3,"sensorNumber":3,"name":"Ethanol Tank Pressure Sensor","abbrev":"eth_tank"},"position":{"width":3,"height":4.5,"x":11,"y":7.5}}]}')},67:function(t,e,a){},74:function(t,e,a){"use strict";a.r(e);var n=a(13),i=a(12),r=a(19),s=a(17),c=a(20),o=a(33),l=a(32),h=a(0),u=a.n(h),d=a(14),b=a.n(d),j=(a(67),a(3)),p=a(93),m=a(5),f=a(109),x=a(1),v=["children","title"];function O(t){var e=t.children;return Object(x.jsx)("div",{style:{width:"100%",padding:"6px",height:"40px"},children:Object(x.jsx)("h1",{children:e})})}function g(){return Object(x.jsxs)("div",{className:"top-bar",children:[Object(x.jsx)("img",{src:"./logo.png",alt:"logo"}),Object(x.jsx)("h1",{children:"Test Stand Control Panel"})]})}function y(t){var e=t.children,a=t.title,i=Object(j.a)(t,v);return Object(x.jsxs)("div",Object(n.a)(Object(n.a)({className:"panel"},i),{},{children:[Object(x.jsx)(O,{children:a}),Object(x.jsx)(p.a,{style:{width:"100%",height:"calc(100% - 52px"},children:e})]}))}var k=Object(m.a)((function(t){return{root:{width:60,height:32,padding:1,display:"flex"},switchBase:{padding:2,color:t.palette.grey[500],"&$checked":{transform:"translateX(26px)",color:t.palette.common.white,"& + $track":{opacity:1,backgroundColor:t.palette.primary.main,borderColor:t.palette.primary.main}}},thumb:{width:28,height:28,boxShadow:"none"},track:{border:"1px solid ".concat(t.palette.grey[500]),borderRadius:8,opacity:1,backgroundColor:t.palette.common.white},checked:{}}}))(f.a);Object(m.a)((function(t){return{root:{position:"absolute",top:"-10px",left:"-10px",width:"6vw"}}}))(f.a);function w(t){var e=t.value,a=t.setValue;return Object(x.jsxs)("div",{className:"toggle-switch",style:{width:60},children:[Object(x.jsx)("span",{className:e?"inactive":"active",children:"Off"}),Object(x.jsx)(k,{checked:e,onChange:function(){return a(!e)}}),Object(x.jsx)("span",{className:e?"active":"inactive",style:{textAlign:"right",width:"100%",display:"block"},children:"On"})]})}function M(t){var e="";e=t.children?t.children:Object(x.jsx)(w,{value:t.switchValue,setValue:t.setSwitchValue});var a=t.label?{cursor:"help",borderBottom:"1px dotted #333"}:{};return Object(x.jsxs)("div",{className:"safety-card",children:[Object(x.jsx)("h2",{title:t.label,style:a,children:t.title}),e]})}function S(t){var e=t.state,a=t.emit,n=t.that,i=null!==e.data&&e.data.arming_switch,r=null!==e.data&&e.data.manual_switch,s=null!==e.data&&e.data.data_logging,c=null!==e.data&&e.data.UPS_status;return Object(x.jsx)(y,{title:"Safety",className:"panel safety",children:Object(x.jsxs)("div",{className:"flex",style:{justifyContent:"flex-start"},children:[Object(x.jsx)(M,{title:"Arming Switch",label:"Controls if the state can change",isButton:"false",switchValue:i,setSwitchValue:function(t){return a("ARMINGSWITCH",t)}}),Object(x.jsx)(M,{title:"Manual Control",label:"Allow manual pin operation",isButton:"false",switchValue:r,setSwitchValue:function(t){return a("MANUALSWITCH",t)}}),Object(x.jsx)(M,{title:"Data Logging",label:"Logging data",isButton:"false",switchValue:s,setSwitchValue:function(t){return a("DATALOG",t)}}),Object(x.jsx)(M,{title:"R-Pi IP",label:"Local IP address of the Raspberry Pi. Must be on the same network. If it's incorrect no new data will appear",children:Object(x.jsx)("input",{value:e.wsAddress,size:"10",onChange:function(t){n.setState({wsAddress:t.target.value},(function(){localStorage.setItem("wsaddr",t.target.value),n.connect()}))},placeholder:e.defaultWSAddress})}),Object(x.jsxs)(M,{title:"Ping",label:"Time delay to reach the server",children:[e.ping?e.ping:"0","ms"]}),c&&Object(x.jsx)(M,{title:"UPS Status",children:c})]})})}var _=a(9),N=a(51),E=a(110),L=a(34);function P(t){if(t<0)return P(-t);if(0===t)return 0;var e=-Math.floor(Math.log10(t)),a=Math.log10(t)+e,n=[0,Math.log10(2),Math.log10(5),1],i=n[0],r=n[1],s=n[2],c=n[3],o=[Math.abs(a-i),Math.abs(a-r),Math.abs(a-s),Math.abs(a-c)],l=Math.min.apply(Math,o);return(l===o[0]?1:l===o[1]?2:l===o[2]?5:10)*Math.pow(10,-e)}function T(t,e){return parseFloat(t.toPrecision(e))}function C(t,e){var a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:3;return Math.abs(t)>=1e12?"".concat(T(t/1e12,a)," T").concat(e):Math.abs(t)>=1e9?"".concat(T(t/1e9,a)," G").concat(e):Math.abs(t)>=1e6?"".concat(T(t/1e6,a)," M").concat(e):Math.abs(t)>=1e3?"".concat(T(t/1e3,a)," k").concat(e):Math.abs(t)>=1?"".concat(T(t,a)," ").concat(e):Math.abs(t)>=.001?"".concat(T(1e3*t,a)," m").concat(e):Math.abs(t)>=1e-6?"".concat(T(1e6*t,a)," \u03bc").concat(e):Math.abs(t)>=1e-9?"".concat(T(1e9*t,a)," n").concat(e):Math.abs(t)>=1e-12?"".concat(T(1e12*t,a)," p").concat(e):"0 ".concat(e)}function A(t,e,a,n){for(var i=P((e-t)/a),r=[],s=Math.ceil(t/i)*i,c=Math.floor(e/i)*i,o=s;o<=c;o+=i)Math.abs(o)<1e-10&&(o=0),r.push({tick:o,label:C(o,n)});return r}function V(t,e,a){for(var n,i=0,r=a-1;i<=r;){var s=t(n=Math.floor((i+r)/2));if(s===e)return n;s<e?i=n+1:r=n-1}return r}function X(t,e){return t?e?[Math.min(t[0],e[0]),Math.max(t[1],e[1])]:t:e}function I(t,e){var a=Object(_.a)(t,2),n=a[0],i=a[1],r=Object(_.a)(e,2);return[n+(i-n)*r[0],i-(i-n)*(1-r[1])]}var z=function(){function t(e){Object(r.a)(this,t),this.capacity=e,this.array=new Float64Array(this.capacity),this.size=0,this.chunks=0}return Object(s.a)(t,[{key:"push",value:function(){for(var t=arguments.length,e=new Array(t),a=0;a<t;a++)e[a]=arguments[a];try{this.array.set(e,this.size),this.size+=e.length,this.chunks++}catch(n){console.error(this,e),console.error(n)}}},{key:"shrink",value:function(){var t=new Float64Array(this.size);t.set(this.array.subarray(0,this.size)),this.array=t}}]),t}(),W=function(t){Object(o.a)(a,t);var e=Object(l.a)(a);function a(t){return Object(r.a)(this,a),e.call(this,4*t)}return Object(s.a)(a,[{key:"time",value:function(t){return this.array[4*t]}},{key:"mean",value:function(t){return this.array[4*t+1]}},{key:"min",value:function(t){return this.array[4*t+2]}},{key:"max",value:function(t){return this.array[4*t+3]}},{key:"updateDecimation",value:function(t){var e=t.chunks;this.chunks=Math.ceil(e/2),this.size=4*this.chunks;var a=this.size;if(0!==e)switch(e%2){case 0:this.array[a-4]=t.time(e-1),this.array[a-3]=(t.mean(e-2)+t.mean(e-1))/2,this.array[a-2]=Math.min(t.min(e-2),t.min(e-1)),this.array[a-1]=Math.max(t.max(e-2),t.max(e-1));break;case 1:this.array[a-4]=t.time(e-1),this.array[a-3]=t.mean(e-1),this.array[a-2]=t.min(e-1),this.array[a-1]=t.max(e-1)}}}]),a}(z),F=function(t){Object(o.a)(a,t);var e=Object(l.a)(a);function a(t){return Object(r.a)(this,a),e.call(this,2*t)}return Object(s.a)(a,[{key:"time",value:function(t){return this.array[2*t+0]}},{key:"mean",value:function(t){return this.array[2*t+1]}},{key:"min",value:function(t){return this.array[2*t+1]}},{key:"max",value:function(t){return this.array[2*t+1]}}]),a}(z),R=function(){function t(){Object(r.a)(this,t),this.n_bound=12,this.capacity=524288,this.arrays={},this.arrays[0]=new F(this.capacity);for(var e=1;e<=this.n_bound;e++)this.arrays[e]=new W(this.capacity>>e)}return Object(s.a)(t,[{key:"push",value:function(t,e){this.arrays[0].push(t,e);for(var a=1;a<=this.n_bound;a++)this.arrays[a].updateDecimation(this.arrays[a-1])}},{key:"sample",value:function(t,e){var a=this,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:200,i=[Math.max(V((function(t){return a.arrays[0].time(t)}),t,this.arrays[0].chunks),0),Math.min(V((function(t){return a.arrays[0].time(t)}),e,this.arrays[0].chunks)+2,this.arrays[0].chunks)],r=i[1]-i[0],s=Math.min(this.n_bound,Math.max(0,1+Math.floor(Math.log(r/n+.01)/Math.log(2))))||0,c=[Math.max(V((function(t){return a.arrays[s].time(t)}),t,this.arrays[s].chunks),0),Math.min(V((function(t){return a.arrays[s].time(t)}),e,this.arrays[s].chunks)+2,this.arrays[s].chunks)],o=c[1]-c[0],l=new Array(o);l.min=1/0,l.max=-1/0;for(var h=0;h<o;h++)l[h]=[this.arrays[s].time(c[0]+h),this.arrays[s].mean(c[0]+h),this.arrays[s].min(c[0]+h),this.arrays[s].max(c[0]+h)],l.min=Math.min(l.min,l[h][2]),l.max=Math.max(l.max,l[h][3]);return l.decimated=s>0,l.getPoints=function(t,e,a){for(var n="",i=0;i<o;i++)n+="".concat(t(l[i][0]-a),",").concat(e(l[i][1])," ");return n},l.getMinMaxPoints=function(t,e,a){for(var n="",i=0;i<o;i++)n+="".concat(t(l[i][0]-a),",").concat(e(l[i][2])," ");for(var r=o-1;r>=0;r--)n+="".concat(t(l[r][0]-a),",").concat(e(l[r][3])," ");return n},l}},{key:"shrink",value:function(){for(var t=0;t<=this.n_bound;t++)this.arrays[t].shrink()}}]),t}(),B=function(){function t(){Object(r.a)(this,t),this.series=[new R]}return Object(s.a)(t,[{key:"push",value:function(t,e){isNaN(t)||isNaN(e)?this.series[this.series.length-1].arrays[0].chunks>0&&(this.series[this.series.length-1].shrink(),this.series.push(new R)):this.series[this.series.length-1].push(t,e)}},{key:"sample",value:function(t,e,a){var n=this.series.map((function(n){return n.sample(t,e,a)}));return n.totalLength=n.reduce((function(t,e){return t+e.length}),0),n.splitPointIndex=function(t){for(var e=0;e<n.length;e++){if(t<n[e].length)return[e,t];if((t-=n[e].length)<0)return[-1,-1]}},n.fromPointIndex=function(t){var e=n.splitPointIndex(t),a=Object(_.a)(e,2),i=a[0],r=a[1];return n[i][r]},n.min=Math.min.apply(Math,Object(i.a)(n.map((function(t){return t.min})))),n.max=Math.max.apply(Math,Object(i.a)(n.map((function(t){return t.max})))),n}}]),t}(),H=a(31),D=["time"];window.enablePageScroll=L.enablePageScroll,window.disablePageScroll=L.disablePageScroll;var U=null,G=[-10,10],J=function(t){return document.dispatchEvent(new CustomEvent("datalogger-new-data",{detail:t}))};var q=function(t){var e=t.series,a=t.unit,r=t.label,s=Array.from(Object.keys(e)),c=s.reduce((function(t,e){return t[e]=new B,t}),{}),o=[],l=function(){};return document.addEventListener("datalogger-new-data",(function(t){var e,a=t.detail,n=Object(N.a)(s);try{for(n.s();!(e=n.n()).done;){var i=e.value;i in a&&c[i].push(a.time,a[i])}}catch(r){n.e(r)}finally{n.f()}l()})),document.addEventListener("datalogger-new-event",(function(t){var e=t.detail;o.push(Object(n.a)(Object(n.a)({},e),{},{key:o.length})),l()})),function(t){var h=t.currentSeconds,d=u.a.useRef(null);l=u.a.useReducer((function(t){return t+1}),0)[1];var b=600,p=450,m=u.a.useState([-3]),f=Object(_.a)(m,2),v=f[0],O=f[1];h||(h=(new Date).getTime()/1e3);var g,y,k,w=1===v.length?[h+v[0],h]:v,M=[w[0]-h,w[1]-h],S=null,N=s.reduce((function(t,e){var a;return t[e]=(a=c[e]).sample.apply(a,Object(i.a)(w).concat([300])),S=X(S,[t[e].min,t[e].max]),t}),{});S=X(S,G),y=S,k=.1,U=(g=U)?y?[g[0]+(y[0]-g[0])*k,g[1]+(y[1]-g[1])*k]:g:y;var P=u.a.useState([0,1]),T=Object(_.a)(P,2),z=T[0],W=T[1],F=function(t,e){var a=Object(_.a)(t,2);return I([a[0],a[1]],[-e,1+e])}(I(U,z),.2),R=[s.reduce((function(t,e){var a=c[e].series[0].arrays[0].time(0);return a&&(t=Math.min(t,a)),t}),h),h],B=90,H=16,J=10,q=35,Q=function(t){return B+t*(b-B-H)},Y=function(t){return J+t*(p-J-q)},$=function(t){return Q((t-M[0])/(M[1]-M[0]))},K=function(t){return Y(1-(t-F[0])/(F[1]-F[0]))},Z=function(t){return M[0]+function(t){return(t-B)/(b-B-H)}(t)*(M[1]-M[0])},tt=A.apply(void 0,M.concat([4,"s"])),et=A(F[0],F[1],10,"psi"),at=u.a.useState(null),nt=Object(_.a)(at,2),it=nt[0],rt=nt[1],st=s.map((function(t){if(!N[t].length)return null;var e=V((function(e){return N[t].fromPointIndex(e)[0]}),h+Z(it),N[t].totalLength-1);if(-1===e)return null;var a=N[t].splitPointIndex(e),n=Object(_.a)(a,2),i=n[0],r=n[1];return r>=N[t][i].length-1||i<0||r<0?null:[i,r]})).map((function(t,e){if(null===t)return"";var n,i,r,c,o,l=Object(_.a)(t,2),u=l[0],d=l[1],b=N[s[e]],j=(n=b[u][d][0],i=b[u][d][1],r=b[u][d+1][0],c=b[u][d+1][1],o=h+Z(it),i+(c-i)*(o-n)/(r-n));return"".concat(s[e],": ").concat(C(j,a))})).filter((function(t){return t.length})),ct=it>Q(1)-160,ot=u.a.useState(!1),lt=Object(_.a)(ot,2),ht=lt[0],ut=lt[1],dt=u.a.useState(null),bt=Object(_.a)(dt,2),jt=bt[0],pt=bt[1],mt=o.map((function(t){var e=t.time,a=Object(j.a)(t,D);return Object(n.a)({x:$(e-h)},a)})).filter((function(t){var e=t.x;return e>=Q(0)-10&&e<=Q(1)}));return u.a.useEffect((function(){document.body.addEventListener("mouseup",(function(){return ut(!1)}))}),[]),Object(x.jsxs)("div",{children:[Object(x.jsxs)("svg",{viewBox:"0 0 ".concat(b," ").concat(p),xmlns:"http://www.w3.org/2000/svg",width:b,height:p,style:{userSelect:"none",fontFamily:"sans-serif"},ref:d,onMouseOver:function(){return Object(L.disablePageScroll)()},onMouseOut:function(t){var e,a=null===(e=d.current)||void 0===e?void 0:e.getBoundingClientRect();Object(L.enablePageScroll)(),(t.clientX<a.left||t.clientX>a.right||t.clientY<a.top||t.clientY>a.bottom)&&rt(null)},onMouseMove:function(t){var e,a=t.clientX-(null===(e=d.current)||void 0===e?void 0:e.getBoundingClientRect().left);if(rt(a),ht&&null===jt&&pt([a,w]),ht&&null!==jt){var n=Object(_.a)(jt,2),i=n[0],r=n[1],s=Z(i)-Z(a),c=[r[0]+s,r[1]+s];c[0]<R[0]&&c[1]>R[1]?c=R:c[0]<R[0]?(s=R[0]-c[0],c=[c[0]+s,c[1]+s]):c[1]>R[1]&&(s=R[1]-c[1],c=[c[0]+s,c[1]+s]),c[1]===R[1]?O([c[0]-c[1]]):O(c)}ht||null===jt||pt(null)},onMouseDown:function(){return ut(!0)},onWheel:function(t){var e=t.deltaX+t.deltaY;if(1===v.length){var a=Math.max(v[0]*Math.pow(1.001,-e),Math.min(R[0]-h,-10));O([Math.min(a,-.01)])}else{var n=(v[0]+v[1])/2,i=Math.max(n+(v[0]-n)*Math.pow(1.001,-e),Math.min(R[0]+.01,h-10)),r=Math.min(n+(v[1]-n)*Math.pow(1.001,-e),R[1]);O([Math.min(i,r-.01),r])}},children:[Object(x.jsx)("defs",{children:Object(x.jsx)("clipPath",{id:"data-clip-path",children:Object(x.jsx)("rect",{x:Q(0),y:Y(0),width:Q(1)-Q(0),height:Y(1)-Y(0)})})}),Object(x.jsx)("line",{x1:Q(0),y1:Y(1),x2:Q(1),y2:Y(1),stroke:"black",strokeWidth:"2"}),Object(x.jsx)("text",{x:Q(.5),y:448,textAnchor:"middle",fontSize:"12",fontWeight:"bold",children:"Time (s)"}),tt.map((function(t){var e=t.tick,a=t.label;return Object(x.jsxs)(u.a.Fragment,{children:[Object(x.jsx)("line",{x1:$(e),y1:Y(1),x2:$(e),y2:Y(1)+5,stroke:"black"}),Object(x.jsx)("text",{x:$(e),y:Y(1)+7,textAnchor:"middle",alignmentBaseline:"text-before-edge",fontSize:"12",children:a})]},e)})),Object(x.jsx)("line",{x1:Q(0),y1:Y(0),x2:Q(0),y2:Y(1),stroke:"black",strokeWidth:"2"}),Object(x.jsxs)("text",{y:20,x:-Y(.5),textAnchor:"middle",fontSize:"12",fontWeight:"bold",transform:"rotate(-90)",dy:"-0.5em",children:[r," (",a,")"]}),et.map((function(t){var e=t.tick,a=t.label;return Object(x.jsxs)(u.a.Fragment,{children:[Object(x.jsx)("line",{x1:Q(0),y1:K(e),x2:Q(0)-5,y2:K(e),stroke:"black"}),Object(x.jsx)("text",{x:Q(0)-7,y:K(e),textAnchor:"end",alignmentBaseline:"middle",fontSize:"12",children:a})]},e)})),mt.map((function(t,e){var a=t.x,n=t.label,i=t.key;return Object(x.jsxs)("g",{children:[Object(x.jsx)("line",{x1:a,y1:Y(0),x2:a,y2:Y(1),stroke:"#333",strokeWidth:"1",strokeDasharray:"2 4",clipPath:"url(#data-clip-path)"}),Object(x.jsx)("text",{x:a+5,y:Y(1)-e%10*10,textAnchor:"start",alignmentBaseline:"text-after-edge",fontSize:"12",clipPath:"url(#data-clip-path)",children:n})]},i)})),s.map((function(t){return Object(x.jsxs)("g",{children:[N[t].map((function(a,n){return a.length&&a.decimated&&Object(x.jsx)("polygon",{points:a.getMinMaxPoints($,K,h),fill:e[t].color,opacity:"0.3",stroke:"none",strokeWidth:"0",clipPath:"url(#data-clip-path)"},n)})),N[t].map((function(a,n){return a.length&&Object(x.jsx)("polyline",{points:a.getPoints($,K,h),fill:"none",stroke:e[t].color,strokeWidth:"1",clipPath:"url(#data-clip-path)"},n)}))]},t)})),s.map((function(t,a){return Object(x.jsxs)("g",{children:[Object(x.jsx)("circle",{r:"3.5",fill:e[t].color,cx:595,cy:14+20*a}),Object(x.jsx)("text",{fontSize:"12",x:585,textAnchor:"end",alignmentBaseline:"middle",fill:e[t].color,y:15+20*a,children:t})]},t)})),st.length&&it>Q(0)&&Object(x.jsxs)("g",{children:[Object(x.jsx)("line",{x1:it,y1:Y(0),x2:it,y2:Y(1),stroke:"black",strokeWidth:"1",clipPath:"url(#data-clip-path)"}),st.map((function(t,e){return Object(x.jsx)("text",{x:Math.min(it+(ct?-5:5),Q(1)-70),y:Y(0)+20+16*e,textAnchor:ct?"end":"start",alignmentBaseline:"text-after-edge",fontSize:"12",clipPath:"url(#data-clip-path)",children:t},e)}))]})]}),Object(x.jsx)("button",{className:"jump-to-present "+(1!==v.length?"active":""),onClick:function(){return O([v[0]-v[1]])},children:">"}),Object(x.jsx)(E.a,{value:w,onChange:function(t,e){e[1]>=h-.01*(h-R[0])?O([Math.min(e[0]-e[1],-.01)]):(e[1]-e[0]<.01&&(e[0]=e[1]-.01),O(e))},valueLabelDisplay:"off",min:Math.min(R[0],R[1]-10),max:R[1],style:{width:560,marginLeft:50},step:.01,marks:[{value:Math.min(R[0],R[1]-10),label:"".concat(Math.max(10,Math.round(R[1]-R[0])),"s ago")},{value:R[1],label:"now"}]}),Object(x.jsx)(E.a,{value:z,onChange:function(t,e){W([Math.min.apply(Math,Object(i.a)(e)),Math.max.apply(Math,Object(i.a)(e))])},valueLabelDisplay:"off",min:0,max:1,style:{width:560,marginLeft:50},step:.005,marks:[{value:0,label:"Bottom"},{value:1,label:"Top"}]}),Object(x.jsx)("button",{onClick:function(){var t=d.current,e=(new XMLSerializer).serializeToString(t),a=new Blob([e],{type:"image/svg+xml"}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download="graph.svg",i.click()},children:"Download SVG"})]})}}({unit:"psi",label:"Pressure",series:{"LOX Tank":{color:"#000"},"LOX N2":{color:"#f00"},"ETH Tank":{color:"#3d6"},"ETH N2":{color:"#09f"}}});function Q(t){var e,a=t.state;return Object(x.jsx)(y,{title:"Graphs",className:"panel graphs",children:Object(x.jsx)(q,{currentSeconds:parseInt(null===(e=a.data)||void 0===e?void 0:e.time)/1e3})})}var Y=a(35),$=a.n(Y),K=a(45),Z=a(107),tt=a(97),et=a(98),at=a(99),nt=a(100),it=a(101),rt=a(102),st=a(103),ct=a(104),ot=a(105),lt=a(106);function ht(t){var e,a=t.state,n=t.emit,i=null!==(e=a.data&&a.data.current_sequence)&&void 0!==e?e:[],r=null===a.data?null:a.data.command_in_flight,s=u.a.useState(!1),c=Object(_.a)(s,2),o=c[0],l=c[1],h=function(){var t=Object(K.a)($.a.mark((function t(e){var a,i;return $.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(0!==e.target.files.length){t.next=2;break}return t.abrupt("return");case 2:if(a=e.target.files[0],!1===(i=j(a))){t.next=12;break}return t.t0=n,t.next=8,i;case 8:t.t1=t.sent,(0,t.t0)("SETSEQUENCE",t.t1),t.next=13;break;case 12:l(!0);case 13:e.target.value="";case 14:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}();function d(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:",",a=t.split("\n"),n=a.map((function(t){return t.split(e).map((function(t){return t.trim()}))}));return n}var b=function(t){var e=new FileReader;return new Promise((function(a,n){e.onerror=function(){e.abort(),n(new DOMException("Problem parsing input file."))},e.onload=function(){a(e.result)},e.readAsText(t)}))};function j(t){return p.apply(this,arguments)}function p(){return(p=Object(K.a)($.a.mark((function t(e){var a,n,i;return $.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,b(e);case 2:a=t.sent,n=d(a),i=[],t.prev=5,n.forEach((function(t){if("OPEN"===t[0]||"CLOSE"===t[0]){if(3!==t.length)throw new Error("invalid input");if("lox"!==t[1].toLowerCase()&&"eth"!==t[1].toLowerCase())throw new Error("invalid input");var e=Number.parseInt(t[2]);if(!e)throw new Error("invalid input");i.push({header:t[0],parameter:{name:t[1],pin:e}})}else{if("SLEEP"!==t[0]){if(""===t[0])return;throw new Error("invalid input")}if(2!==t.length)throw new Error("invalid input");var a=Number.parseInt(t[1]);if(!a)throw new Error("invalid input");i.push({header:t[0],parameter:a})}})),t.next=12;break;case 9:return t.prev=9,t.t0=t.catch(5),t.abrupt("return",!1);case 12:return t.abrupt("return",i);case 13:case"end":return t.stop()}}),t,null,[[5,9]])})))).apply(this,arguments)}var m=a.data&&a.data.arming_switch;return Object(x.jsxs)(y,{title:"Sequences",children:[Object(x.jsx)("div",{children:Object(x.jsxs)(Z.a,{open:o,"aria-labelledby":"alert-dialog-title","aria-describedby":"alert-dialog-description",children:[Object(x.jsx)(tt.a,{id:"alert-dialog-title",children:"Invalid CSV"}),Object(x.jsx)(et.a,{children:Object(x.jsx)(at.a,{id:"alert-dialog-description",children:"Confirm the CSV given was valid, read documentation if unsure."})}),Object(x.jsx)(nt.a,{children:Object(x.jsx)(it.a,{onClick:function(){l(!1)},color:"primary",autoFocus:!0,children:"Understood!"})})]})}),Object(x.jsxs)("div",{className:"flex",children:[Object(x.jsx)("div",{style:{width:"200px",borderRight:"1px solid #999",height:"100%"},children:Object(x.jsxs)("div",{className:"frame",children:[Object(x.jsx)("h2",{children:"Start Sequence"}),Object(x.jsx)("div",{children:Object(x.jsx)("input",{type:"file",accept:".csv",maxLength:"1",onChange:h})}),Object(x.jsx)("br",{}),Object(x.jsx)("button",{onClick:function(){return n("BEGINSEQUENCE",null)},style:{backgroundColor:m?"lime":"lightgrey",padding:10,cursor:"pointer"},children:"Start"}),Object(x.jsx)("br",{}),Object(x.jsx)("br",{}),Object(x.jsx)(M,{title:"Run Abort Sequence",children:Object(x.jsx)("button",{onClick:function(){return n("ABORTSEQUENCE",t);var t},style:{backgroundColor:m?"tomato":"lightgrey",padding:10,cursor:"pointer"},children:"ABORT"})})]})}),Object(x.jsx)("div",{style:{overflow:"auto",width:"100%",height:"100%"},children:Object(x.jsxs)(rt.a,{stickyHeader:!0,"aria-label":"simple table",children:[Object(x.jsx)(st.a,{children:Object(x.jsxs)(ct.a,{children:[Object(x.jsx)(ot.a,{align:"center",children:"Command"}),Object(x.jsx)(ot.a,{align:"center",children:"LabJack"}),Object(x.jsx)(ot.a,{align:"center",children:"Value"})]})}),Object(x.jsxs)(lt.a,{children:[r&&Object(x.jsxs)(ct.a,{style:{background:"#94F690"},children:[Object(x.jsx)(ot.a,{component:"th",scope:"row",children:r.header}),Object(x.jsx)(ot.a,{align:"center",children:r.data.name&&r.data.name}),Object(x.jsx)(ot.a,{align:"center",children:r.data.name?r.data.pin:((r.time-a.data.time)/1e3).toFixed(4)})]}),i.map((function(t){return Object(x.jsxs)(ct.a,{children:[Object(x.jsx)(ot.a,{component:"th",scope:"row",children:t.header}),Object(x.jsx)(ot.a,{align:"center",children:void 0===t.data.name?"":t.data.name}),Object(x.jsx)(ot.a,{align:"center",children:void 0===t.data.name?t.data:t.data.pin})]})}))]})]})})]})]})}function ut(t,e,a,n){return 14.504*((t/120-a/1e3)/(n/1e3)*e)}var dt={eth_tank:{barMax:100,zero:3.99,span:16.02},lox_tank:{barMax:100,zero:3.99,span:16.04},eth_n2:{barMax:250,zero:4,span:16},lox_n2:{barMax:250,zero:4,span:16}};function bt(t,e){return 14.504*(e/2.4*(t-.48))}var jt={time:NaN,"LOX Tank":NaN,"LOX N2":NaN,"ETH Tank":NaN,"ETH N2":NaN},pt=["state","emit"],mt=["state","emit"];function ft(t){return"".concat(26*t,"px")}function xt(t){var e=t.x,a=t.y,i=t.width,r=t.height,s=t.enabled;return Object(n.a)({position:"absolute",borderStyle:"solid",borderColor:"transparent",width:ft(i),height:ft(r),top:ft(a),left:ft(e)},s?{}:{cursor:"help"})}function vt(t){var e=t.state,a=t.emit,n=Object(j.a)(t,pt),i=null!==e.data&&e.data.labjacks[n.test_stand].digital[n.labjack_pin],r=xt(n),s={position:"absolute",margin:"auto",fontSize:"1rem",top:ft(n.y-1),left:ft(n.x-1)};return Object(x.jsxs)("div",{children:[e.data&&Object(x.jsxs)("div",{style:r,title:n.enabled?"":"Please enable the arming and manual control switches to toggle",children:[Object(x.jsx)(f.a,{checked:i,onChange:function(){return e.data.labjacks[n.test_stand].digital[n.labjack_pin]?a("CLOSE",{name:n.test_stand,pin:parseInt(n.labjack_pin)}):a("OPEN",{name:n.test_stand,pin:parseInt(n.labjack_pin)})},disabled:!n.enabled}),Object(x.jsxs)("label",{className:(i?"active":"inactive")+" control-label "+(n.enabled?"":"disabled"),children:[Object(x.jsx)("br",{}),i?"Open":"Closed"]})]}),Object(x.jsx)("h4",{style:s,children:n.title})]})}function Ot(t){var e=t.state,a=(t.emit,Object(j.a)(t,mt)),i=xt(Object(n.a)({enabled:!0},a)),r=null,s=null;if(e.data){r=e.data.labjacks[a.test_stand].analog[a.labjack_pin];var c=dt[a.sensorName];s=ut(r,c.barMax,c.zero,c.span)}return s&&s>29.3918&&(i.backgroundColor="tomato"),Object(x.jsxs)("div",{style:i,children:[Object(x.jsx)("div",{children:a.title}),s&&Object(x.jsxs)("div",{children:[s.toFixed(1)," PSI"]}),r&&Object(x.jsxs)("div",{children:["(",r.toFixed(2),"V)"]})]})}function gt(t){var e=t.state,a=t.emit;return Object(x.jsx)(y,{title:"Control Panel",className:"panel control",children:Object(x.jsxs)("div",{className:"control-panel",children:[H.buttons.map((function(t){return Object(x.jsx)(vt,Object(n.a)(Object(n.a)(Object(n.a)({title:t.pin.test_stand.charAt(0)+" "+t.pin.abbrev+" "+t.pin.labjack_pin,state:e,emit:a},t.pin),t.position),{},{enabled:e.data&&e.data.arming_switch&&e.data.manual_switch}),t.pin.name)})),H.sensors.map((function(t){return Object(x.jsx)(Ot,Object(n.a)(Object(n.a)(Object(n.a)({title:t.pin.abbrev,state:e,emit:a},t.pin),t.position),{},{sensorName:t.pin.abbrev}),t.pin.name)}))]})})}var yt=a(108),kt=function(t){Object(o.a)(a,t);var e=Object(l.a)(a);function a(t){var n;return Object(r.a)(this,a),(n=e.call(this,t)).state={data:null,mostRecentWarning:{},showWarning:!1,wsAddress:localStorage.getItem("wsaddr")||"192.168.0.5",defaultWSAddress:"192.168.0.5",events:[]},n.emit=n.emit.bind(Object(c.a)(n)),n.connect(),n}return Object(s.a)(a,[{key:"componentDidMount",value:function(){var t=this;this.interval=setInterval((function(){return t.emit("PING")}),200),this.mounted=!0}},{key:"componentWillUnmount",value:function(){this.mounted=!1,clearInterval(this.interval)}},{key:"connect",value:function(){var t=this;this.socket&&this.socket.close();try{this.socket=new WebSocket("ws://".concat(this.state.wsAddress,":8888")),this.socket.onopen=function(t){return console.log("websocket connection established")},this.socket.onclose=function(e){t.socket=null,console.log("websocket connection lost. reconnecting..."),J(jt),setTimeout((function(){t.socket||t.connect()}),1e3)},this.socket.onmessage=function(e){if(t.mounted){var a,r,s,c=JSON.parse(e.data);switch(c.type){case"STATE":J((s=c.data,{time:parseInt(s.time)/1e3,"LOX Tank":ut(s.labjacks.LOX.analog[3],dt.lox_tank.barMax,dt.lox_tank.zero,dt.lox_tank.span),"LOX N2":bt(s.labjacks.LOX.analog[1],250),"ETH Tank":ut(s.labjacks.ETH.analog[3],dt.eth_tank.barMax,dt.eth_tank.zero,dt.eth_tank.span),"ETH N2":bt(s.labjacks.ETH.analog[1],250)})),t.setState({data:c.data});break;case"PING":t.setState({ping:(new Date).getTime()-c.data});break;case"VALVE":var o=parseInt(t.state.data.time)/1e3,l=(r=c.data.data.pin,H.buttons.filter((function(t){return t.pin.labjack_pin===r}))[0]).pin,h=("CLOSE"===c.data.header?"Closed":"Opened")+" "+l.test_stand+" "+l.abbrev;a={time:o,label:h},document.dispatchEvent(new CustomEvent("datalogger-new-event",{detail:a})),t.setState({events:[].concat(Object(i.a)(t.state.events),[Object(n.a)(Object(n.a)({},c.data),{},{label:h,time:o})])});break;default:console.error(c)}}}}catch(e){console.error(e)}}},{key:"emit",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this.socket&&this.socket.readyState===WebSocket.OPEN&&this.socket.send(JSON.stringify({command:{header:t,data:e},time:(new Date).getTime()}))}},{key:"render",value:function(){var t=this;return this.state.data&&this.state.data.latest_warning&&this.state.data.latest_warning.id!==this.state.mostRecentWarning.id&&(console.log(this.state.mostRecentWarning),this.setState({mostRecentWarning:this.state.data.latest_warning,showWarning:!0})),Object(x.jsxs)("div",{children:[Object(x.jsx)(g,{}),Object(x.jsxs)("div",{className:"panels-root",children:[Object(x.jsxs)("div",{className:"panel-row-1",children:[Object(x.jsx)(S,{state:this.state,emit:this.emit,that:this}),Object(x.jsx)(ht,{state:this.state,emit:this.emit})]}),Object(x.jsxs)("div",{className:"panel-row-2",children:[Object(x.jsx)(gt,{state:this.state,emit:this.emit}),Object(x.jsx)(Q,{state:this.state,emit:this.emit})]}),this.state.showWarning&&Object(x.jsx)(yt.a,{onClose:function(){t.setState({showWarning:!1})},severity:"error",className:"alert",children:this.state.mostRecentWarning.message})]})]})}}]),a}(u.a.Component);b.a.render(Object(x.jsx)(u.a.StrictMode,{children:Object(x.jsx)(kt,{})}),document.getElementById("root"))}},[[74,1,2]]]);
//# sourceMappingURL=main.20dd596c.chunk.js.map