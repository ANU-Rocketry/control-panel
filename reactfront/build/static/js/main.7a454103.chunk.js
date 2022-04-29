(this.webpackJsonpreactfront=this.webpackJsonpreactfront||[]).push([[0],{30:function(t){t.exports=JSON.parse('{"buttons":[{"pin":{"test_stand":"ETH","labjack_pin":14,"name":"Main Fuel (Ethanol) Valve","abbrev":"main"},"position":{"width":2,"height":1,"x":11.5,"y":15}},{"pin":{"test_stand":"ETH","labjack_pin":12,"name":"Fuel (Ethanol) Fill Valve","abbrev":"fill"},"position":{"width":2,"height":1,"x":8,"y":13}},{"pin":{"test_stand":"ETH","labjack_pin":10,"name":"Fuel (Ethanol) Dump/Drain Valve","abbrev":"drain"},"position":{"width":2,"height":1,"x":4,"y":13}},{"pin":{"test_stand":"ETH","labjack_pin":8,"name":"Fuel (Ethanol) Tank Nitrogen Pressurisation Valve","abbrev":"pres"},"position":{"width":2,"height":1,"x":8,"y":4}},{"pin":{"test_stand":"ETH","labjack_pin":19,"name":"Fuel (Ethanol) Tank Vent Valve","abbrev":"vent"},"position":{"width":2,"height":1,"x":11,"y":1}},{"pin":{"test_stand":"ETH","labjack_pin":17,"name":"Fuel (Ethanol) Line Nitrogen Purge Valve","abbrev":"purge"},"position":{"width":2,"height":1,"x":8,"y":17}},{"pin":{"test_stand":"LOX","labjack_pin":16,"name":"Main Oxidiser (LOX) Valve","abbrev":"main"},"position":{"width":2,"height":1,"x":17.5,"y":15}},{"pin":{"test_stand":"LOX","labjack_pin":18,"name":"Oxidiser (LOX) Fill Valve","abbrev":"fill"},"position":{"width":2,"height":1,"x":21,"y":13}},{"pin":{"test_stand":"LOX","labjack_pin":9,"name":"Oxidiser (LOX) Dump/Drain Valve","abbrev":"drain"},"position":{"width":2,"height":1,"x":25,"y":13}},{"pin":{"test_stand":"LOX","labjack_pin":11,"name":"Oxidiser (LOX) Tank Nitrogen Pressurisation Valve","abbrev":"pres"},"position":{"width":2,"height":1,"x":21,"y":4}},{"pin":{"test_stand":"LOX","labjack_pin":13,"name":"Oxidiser (LOX) Tank Vent Valve","abbrev":"vent"},"position":{"width":2,"height":1,"x":18,"y":1}},{"pin":{"test_stand":"LOX","labjack_pin":15,"name":"Oxidiser (LOX) Line Nitrogen Purge Valve","abbrev":"purge"},"position":{"width":2,"height":1,"x":21,"y":17}}],"sensors":[{"pin":{"test_stand":"LOX","labjack_pin":1,"sensorNumber":0,"name":"LOX Nitrogen Pressurant Sensor","abbrev":"lox_n2"},"position":{"width":5,"height":3,"x":25,"y":3}},{"pin":{"test_stand":"LOX","labjack_pin":3,"sensorNumber":1,"name":"LOX Tank Pressure Sensor","abbrev":"lox_tank"},"position":{"width":3,"height":4.5,"x":17,"y":7.5}},{"pin":{"test_stand":"ETH","labjack_pin":1,"sensorNumber":2,"name":"Ethanol Nitrogen Pressurant Sensor","abbrev":"eth_n2"},"position":{"width":5,"height":3,"x":1,"y":3}},{"pin":{"test_stand":"ETH","labjack_pin":3,"sensorNumber":3,"name":"Ethanol Tank Pressure Sensor","abbrev":"eth_tank"},"position":{"width":3,"height":4.5,"x":11,"y":7.5}}]}')},66:function(t,e,a){},73:function(t,e,a){"use strict";a.r(e);var n=a(16),i=a(10),r=a(34),s=a(21),c=a(18),l=a(52),o=a(51),d=a(0),h=a.n(d),u=a(13),b=a.n(u),j=(a(66),a(3)),p=a(96),m=a(98),x=a(74),f=a(94),O=a(5),g=a(112),v=a(2),k=["children","title"];function w(t){var e=t.children;return Object(v.jsx)("div",{style:{width:"100%",padding:"6px",height:"40px"},children:Object(v.jsx)("h1",{children:e})})}var y=Object(f.a)((function(t){return{root:{flexGrow:1},menuButton:{marginRight:t.spacing(2)},title:{flexGrow:1,paddingLeft:t.spacing(2)}}}));function _(){var t=y();return Object(v.jsx)("div",{className:t.root,children:Object(v.jsx)(p.a,{position:"static",children:Object(v.jsx)(m.a,{children:Object(v.jsx)("h1",{className:t.title,children:"Test Stand Control Software"})})})})}function S(t){var e=t.children,a=t.title,i=Object(j.a)(t,k);return Object(v.jsxs)("div",Object(n.a)(Object(n.a)({className:"panel"},i),{},{children:[Object(v.jsx)(w,{children:a}),Object(v.jsx)(x.a,{style:{width:"100%",height:"calc(100% - 52px"},children:e})]}))}var M=Object(O.a)((function(t){return{root:{width:60,height:32,padding:1,display:"flex"},switchBase:{padding:2,color:t.palette.grey[500],"&$checked":{transform:"translateX(26px)",color:t.palette.common.white,"& + $track":{opacity:1,backgroundColor:t.palette.primary.main,borderColor:t.palette.primary.main}}},thumb:{width:28,height:28,boxShadow:"none"},track:{border:"1px solid ".concat(t.palette.grey[500]),borderRadius:8,opacity:1,backgroundColor:t.palette.common.white},checked:{}}}))(g.a);Object(O.a)((function(t){return{root:{position:"absolute",top:"-10px",left:"-10px",width:"6vw"}}}))(g.a);function E(t){var e=t.value,a=t.setValue;return Object(v.jsxs)("div",{className:"toggle-switch",style:{width:60},children:[Object(v.jsx)("span",{className:e?"inactive":"active",children:"Off"}),Object(v.jsx)(M,{checked:e,onChange:function(){return a(!e)}}),Object(v.jsx)("span",{className:e?"active":"inactive",style:{textAlign:"right",width:"100%",display:"block"},children:"On"})]})}function N(t){var e="";e=t.children?t.children:Object(v.jsx)(E,{value:t.switchValue,setValue:t.setSwitchValue});var a=t.label?{cursor:"help",borderBottom:"1px dotted #333"}:{};return Object(v.jsxs)("div",{className:"safety-card",children:[Object(v.jsx)("h2",{title:t.label,style:a,children:t.title}),e]})}function L(t){var e=t.state,a=t.emit,n=t.that,i=null!==e.data&&e.data.arming_switch,r=null!==e.data&&e.data.manual_switch,s=null!==e.data&&e.data.data_logging;return Object(v.jsx)(S,{title:"Safety",className:"panel safety",children:Object(v.jsxs)("div",{className:"flex",style:{justifyContent:"flex-start"},children:[Object(v.jsx)(N,{title:"Arming Switch",label:"Controls if the state can change",isButton:"false",switchValue:i,setSwitchValue:function(t){return a("ARMINGSWITCH",t)}}),Object(v.jsx)(N,{title:"Manual Control",label:"Allow manual pin operation",isButton:"false",switchValue:r,setSwitchValue:function(t){return a("MANUALSWITCH",t)}}),Object(v.jsx)(N,{title:"Data Logging",label:"Logging data",isButton:"false",switchValue:s,setSwitchValue:function(t){return a("DATALOG",t)}}),Object(v.jsx)(N,{title:"R-Pi IP",label:"Local IP address of the Raspberry Pi. Must be on the same network. If it's incorrect no new data will appear",children:Object(v.jsx)("input",{value:e.wsAddress,size:"10",onChange:function(t){n.setState({wsAddress:t.target.value},(function(){localStorage.setItem("wsaddr",t.target.value),n.connect()}))},placeholder:e.defaultWSAddress})}),Object(v.jsxs)(N,{title:"Ping",label:"Time delay to reach the server",children:[e.ping?e.ping:"0","ms"]})]})})}var T=a(11),P=a(113);function C(t,e,a,n){return 14.504*((t/120-a/1e3)/(n/1e3)*e)}var X={eth_tank:{barMax:100,zero:3.99,span:16.02},lox_tank:{barMax:100,zero:3.99,span:16.04},eth_n2:{barMax:250,zero:4,span:16},lox_n2:{barMax:250,zero:4,span:16}},V=a(31),A=a(30),I=["t_minus_time"];function H(t,e){return 14.504*(e/2.4*(t-.48))}function W(t){for(var e=1/0,a=-1/0,n=0;n<t.length;n++)t[n]<e&&(e=t[n]),t[n]>a&&(a=t[n]);return[e,a]}function F(t,e,a){return[t-(e-t)*a,e+(e-t)*a]}function B(t,e){var a=(null===e||void 0===e?void 0:e.map((function(e){return function(t,e){return{time:parseInt(t.time)/1e3,t_minus_time:(parseInt(t.time)-parseInt(e))/1e3,LOX_Tank_Pressure:C(t.labjacks.LOX.analog[3],X.lox_tank.barMax,X.lox_tank.zero,X.lox_tank.span),LOX_N2_Pressure:H(t.labjacks.LOX.analog[1],250),ETH_Tank_Pressure:C(t.labjacks.ETH.analog[3],X.eth_tank.barMax,X.eth_tank.zero,X.eth_tank.span),ETH_N2_Pressure:H(t.labjacks.ETH.analog[1],250)}}(e,t.data.time)})))||[],n=[].concat(Object(i.a)(a.map((function(t){return t.LOX_Tank_Pressure}))),Object(i.a)(a.map((function(t){return t.LOX_N2_Pressure}))),Object(i.a)(a.map((function(t){return t.ETH_Tank_Pressure}))),Object(i.a)(a.map((function(t){return t.ETH_N2_Pressure}))));return[a,F.apply(void 0,Object(i.a)(W(n)).concat([.1]))]}function R(t,e,a){var n,i=0,r=t.length-1;for(null===a&&(a=function(t){return t});i<=r;){var s=a(t[n=Math.floor((i+r)/2)]);if(s===e)return n;s<e?i=n+1:r=n-1}return r}function z(t,e){return R(t.history,e,(function(t){return parseInt(t.time)/1e3}))}function D(t){if(t<0)return D(-t);if(0===t)return 0;var e=-Math.floor(Math.log10(t)),a=Math.log10(t)+e,n=[0,Math.log10(2),Math.log10(5),1],i=n[0],r=n[1],s=n[2],c=n[3],l=[Math.abs(a-i),Math.abs(a-r),Math.abs(a-s),Math.abs(a-c)],o=Math.min.apply(Math,l);return(o===l[0]?1:o===l[1]?2:o===l[2]?5:10)*Math.pow(10,-e)}function G(t,e){return Math.abs(t)>=1e3?"".concat((t/1e3).toFixed(1)," k").concat(e):Math.abs(t)>=1?"".concat(t.toFixed(1)," ").concat(e):Math.abs(t)>=.001?"".concat((1e3*t).toFixed(1)," m").concat(e):Math.abs(t)>=1e-6?"".concat((1e6*t).toFixed(1)," \u03bc").concat(e):"".concat(t.toFixed(1)," ").concat(e)}function U(t,e,a,n){for(var i=D((e-t)/a),r=[],s=Math.ceil(t/i)*i,c=Math.floor(e/i)*i,l=s;l<=c;l+=i)r.push({tick:l,label:G(l,n)});return r}window.enablePageScroll=V.enablePageScroll,window.disablePageScroll=V.disablePageScroll;var J=null,q=[-10,10];function Q(t){var e=t.state,a=(t.emit,h.a.useRef(null)),n=h.a.useState([-3]),r=Object(T.a)(n,2),s=r[0],c=r[1],l=e.history.length?parseInt(e.data.time)/1e3:(new Date).getTime()/1e3,o=1===s.length?[l+s[0],l]:s,d=[o[0]-l,o[1]-l],u=[Math.max(z(e,o[0]),0),Math.min(z(e,o[1])+2,e.history.length-1)],b=B(e,function(t){var e=t.length,a=Math.floor(e/300)+1;return t.filter((function(t,n){return n%a===0||n===e-1}))}(e.history.slice(u[0],u[1]+1))),p=Object(T.a)(b,2),m=p[0],x=p[1];x=[Math.min(x[0],q[0]),Math.max(x[1],q[1])],J=null===J?x:[.9*J[0]+.1*x[0],.9*J[1]+.1*x[1]];var f=h.a.useState([0,1]),O=Object(T.a)(f,2),g=O[0],k=O[1],w=[J[0]+(J[1]-J[0])*g[0],J[1]-(J[1]-J[0])*(1-g[1])],y=e.history&&e.history.length>0?[parseInt(e.history[0].time)/1e3,parseInt(e.history[e.history.length-1].time)/1e3]:[-1,0],_=600,M=450,E=90,N=16,L=10,C=35,X=function(t){return E+t*(_-E-N)},H=function(t){return L+t*(M-L-C)},W=function(t){return X((t-d[0])/(d[1]-d[0]))},F=function(t){return H(1-(t-w[0])/(w[1]-w[0]))},D=function(t){return d[0]+function(t){return(t-E)/(_-E-N)}(t)*(d[1]-d[0])},Q=U.apply(void 0,d.concat([4,"s"])),Y=U(w[0],w[1],10,"psi"),$=[["LOX_Tank_Pressure","#000000","LOX Tank"],["LOX_N2_Pressure","#ff0000","LOX N2"],["ETH_Tank_Pressure","#33dd66","ETH Tank"],["ETH_N2_Pressure","#0099ff","ETH N2"]],K=h.a.useState(null),Z=Object(T.a)(K,2),tt=Z[0],et=Z[1],at=tt&&function(t,e){return R(t,e,(function(t){return t.time}))}(m,l+D(tt)),nt=at&&at>=0&&$.map((function(t){return t[2]+" "+G(m[at][t[0]],"psi")})),it=at&&tt>X(1)-160,rt=h.a.useState(!1),st=Object(T.a)(rt,2),ct=st[0],lt=st[1],ot=h.a.useState(null),dt=Object(T.a)(ot,2),ht=dt[0],ut=dt[1],bt=e.valveHistory.map((function(t){var e,a=t.header,n=t.data,i=t.time,r=(e=n.pin,A.buttons.filter((function(t){return t.pin.labjack_pin===e}))[0]).pin,s=("CLOSE"===a?"Closed":"Opened")+" "+r.test_stand+" "+r.abbrev;return{x:W(i-l),label:s}}));return Object(v.jsxs)(S,{title:"Graphs",className:"panel graphs",onWheel:function(t){var e=t.deltaX+t.deltaY;if(1===s.length){var a=Math.max(s[0]*Math.pow(1.001,-e),Math.min(y[0]-l,-10));c([Math.min(a,-.01)])}else{var n=(s[0]+s[1])/2,i=Math.max(n+(s[0]-n)*Math.pow(1.001,-e),Math.min(y[0]+.01,l-10)),r=Math.min(n+(s[1]-n)*Math.pow(1.001,-e),y[1]);c([Math.min(i,r-.01),r])}},children:[Object(v.jsxs)("svg",{viewBox:"0 0 ".concat(_," ").concat(M),xmlns:"http://www.w3.org/2000/svg",width:_,height:M,style:{userSelect:"none",fontFamily:"sans-serif"},ref:a,onMouseOver:function(){return Object(V.disablePageScroll)()},onMouseOut:function(t){var e,n=null===(e=a.current)||void 0===e?void 0:e.getBoundingClientRect();Object(V.enablePageScroll)(),(t.clientX<n.left||t.clientX>n.right||t.clientY<n.top||t.clientY>n.bottom)&&et(null)},onMouseMove:function(t){var e,n=t.clientX-(null===(e=a.current)||void 0===e?void 0:e.getBoundingClientRect().left);if(et(n),ct&&null===ht&&ut([n,o]),ct&&null!==ht){var i=Object(T.a)(ht,2),r=i[0],s=i[1],l=D(r)-D(n),d=[Math.max(s[0]+l,y[0]),Math.min(s[1]+l,y[1])];c(d[1]===y[1]?[d[0]-d[1]]:d)}ct||null===ht||ut(null)},onMouseDown:function(){return lt(!0)},onMouseUp:function(){return lt(!1)},children:[Object(v.jsx)("defs",{children:Object(v.jsx)("clipPath",{id:"data-clip-path",children:Object(v.jsx)("rect",{x:X(0),y:H(0),width:X(1)-X(0),height:H(1)-H(0)})})}),Object(v.jsx)("line",{x1:X(0),y1:H(1),x2:X(1),y2:H(1),stroke:"black",strokeWidth:"2"}),Object(v.jsx)("text",{x:X(.5),y:448,textAnchor:"middle",fontSize:"12",fontWeight:"bold",children:"Time (s)"}),Q.map((function(t){var e=t.tick,a=t.label;return Object(v.jsxs)(h.a.Fragment,{children:[Object(v.jsx)("line",{x1:W(e),y1:H(1),x2:W(e),y2:H(1)+5,stroke:"black"}),Object(v.jsx)("text",{x:W(e),y:H(1)+7,textAnchor:"middle",alignmentBaseline:"text-before-edge",fontSize:"12",children:a})]},e)})),Object(v.jsx)("line",{x1:X(0),y1:H(0),x2:X(0),y2:H(1),stroke:"black",strokeWidth:"2"}),Object(v.jsx)("text",{y:20,x:-H(.5),textAnchor:"middle",fontSize:"12",fontWeight:"bold",transform:"rotate(-90)",dy:"-0.5em",children:"Pressure (psi)"}),Y.map((function(t){var e=t.tick,a=t.label;return Object(v.jsxs)(h.a.Fragment,{children:[Object(v.jsx)("line",{x1:X(0),y1:F(e),x2:X(0)-5,y2:F(e),stroke:"black"}),Object(v.jsx)("text",{x:X(0)-7,y:F(e),textAnchor:"end",alignmentBaseline:"middle",fontSize:"12",children:a})]},e)})),bt.map((function(t,e){var a=t.x,n=t.label;return a>=X(0)-100&&a<=X(1)&&Object(v.jsxs)("g",{children:[Object(v.jsx)("line",{x1:a,y1:H(0),x2:a,y2:H(1),stroke:"#333",strokeWidth:"1",strokeDasharray:"4",clipPath:"url(#data-clip-path)"}),Object(v.jsx)("text",{x:a+5,y:H(1)-e%10*10,textAnchor:"start",alignmentBaseline:"text-after-edge",fontSize:"12",clipPath:"url(#data-clip-path)",children:n})]},a)})),$.map((function(t){var e=Object(T.a)(t,3),a=e[0],n=e[1];e[2];return Object(v.jsx)("polyline",{points:m.map((function(t){var e=t.t_minus_time,n=Object(j.a)(t,I);return" ".concat(W(e),",").concat(F(n[a]))})).join(""),fill:"none",stroke:n,strokeWidth:"1",clipPath:"url(#data-clip-path)"},a)})),$.map((function(t,e){var a=Object(T.a)(t,3),n=a[0],i=a[1],r=a[2];return Object(v.jsxs)("g",{children:[Object(v.jsx)("circle",{r:"3.5",fill:i,cx:595,cy:14+20*e}),Object(v.jsx)("text",{fontSize:"12",x:585,textAnchor:"end",alignmentBaseline:"middle",fill:i,y:15+20*e,children:r})]},n)})),nt&&tt>X(0)&&Object(v.jsxs)("g",{children:[Object(v.jsx)("line",{x1:tt,y1:H(0),x2:tt,y2:H(1),stroke:"black",strokeWidth:"1",clipPath:"url(#data-clip-path)"}),nt.map((function(t,e){return Object(v.jsx)("text",{x:Math.min(tt+(it?-5:5),X(1)-70),y:H(0)+20+16*e,textAnchor:it?"end":"start",alignmentBaseline:"text-after-edge",fontSize:"12",clipPath:"url(#data-clip-path)",children:t},Math.random())}))]})]}),Object(v.jsx)(P.a,{value:o,onChange:function(t,e){e[1]>=l-.01*(l-y[0])?c([e[0]-e[1]]):c(e)},valueLabelDisplay:"off",min:y[0],max:y[1],style:{width:560,marginLeft:50},step:.01,marks:[{value:y[0],label:"".concat(Math.round(y[1]-y[0]),"s ago")},{value:y[1],label:"now"}]}),Object(v.jsx)(P.a,{value:g,onChange:function(t,e){k([Math.min.apply(Math,Object(i.a)(e)),Math.max.apply(Math,Object(i.a)(e))])},valueLabelDisplay:"off",min:0,max:1,style:{width:560,marginLeft:50},step:.005,marks:[{value:0,label:"Bottom"},{value:1,label:"Top"}]}),Object(v.jsx)("button",{onClick:function(){var t=a.current,e=(new XMLSerializer).serializeToString(t),n=new Blob([e],{type:"image/svg+xml"}),i=URL.createObjectURL(n),r=document.createElement("a");r.href=i,r.download="graph.svg",r.click()},children:"Download SVG"})]})}var Y=a(32),$=a.n(Y),K=a(44),Z=a(110),tt=a(100),et=a(101),at=a(102),nt=a(103),it=a(104),rt=a(105),st=a(106),ct=a(107),lt=a(108),ot=a(109);function dt(t){var e,a=t.state,n=t.emit,i=null!==(e=a.data&&a.data.current_sequence)&&void 0!==e?e:[],r=null===a.data?null:a.data.command_in_flight,s=h.a.useState(!1),c=Object(T.a)(s,2),l=c[0],o=c[1],d=function(){var t=Object(K.a)($.a.mark((function t(e){var a,i;return $.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(0!==e.target.files.length){t.next=2;break}return t.abrupt("return");case 2:if(a=e.target.files[0],!1===(i=j(a))){t.next=12;break}return t.t0=n,t.next=8,i;case 8:t.t1=t.sent,(0,t.t0)("SETSEQUENCE",t.t1),t.next=13;break;case 12:o(!0);case 13:e.target.value="";case 14:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}();function u(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:",",a=t.split("\n"),n=a.map((function(t){return t.split(e).map((function(t){return t.trim()}))}));return n}var b=function(t){var e=new FileReader;return new Promise((function(a,n){e.onerror=function(){e.abort(),n(new DOMException("Problem parsing input file."))},e.onload=function(){a(e.result)},e.readAsText(t)}))};function j(t){return p.apply(this,arguments)}function p(){return(p=Object(K.a)($.a.mark((function t(e){var a,n,i;return $.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,b(e);case 2:a=t.sent,n=u(a),i=[],t.prev=5,n.forEach((function(t){if("OPEN"===t[0]||"CLOSE"===t[0]){if(3!==t.length)throw new Error("invalid input");if("lox"!==t[1].toLowerCase()&&"eth"!==t[1].toLowerCase())throw new Error("invalid input");var e=Number.parseInt(t[2]);if(!e)throw new Error("invalid input");i.push({header:t[0],parameter:{name:t[1],pin:e}})}else{if("SLEEP"!==t[0]){if(""===t[0])return;throw new Error("invalid input")}if(2!==t.length)throw new Error("invalid input");var a=Number.parseInt(t[1]);if(!a)throw new Error("invalid input");i.push({header:t[0],parameter:a})}})),t.next=12;break;case 9:return t.prev=9,t.t0=t.catch(5),t.abrupt("return",!1);case 12:return t.abrupt("return",i);case 13:case"end":return t.stop()}}),t,null,[[5,9]])})))).apply(this,arguments)}var m=a.data&&a.data.arming_switch;return Object(v.jsxs)(S,{title:"Sequences",children:[Object(v.jsx)("div",{children:Object(v.jsxs)(Z.a,{open:l,"aria-labelledby":"alert-dialog-title","aria-describedby":"alert-dialog-description",children:[Object(v.jsx)(tt.a,{id:"alert-dialog-title",children:"Invalid CSV"}),Object(v.jsx)(et.a,{children:Object(v.jsx)(at.a,{id:"alert-dialog-description",children:"Confirm the CSV given was valid, read documentation if unsure."})}),Object(v.jsx)(nt.a,{children:Object(v.jsx)(it.a,{onClick:function(){o(!1)},color:"primary",autoFocus:!0,children:"Understood!"})})]})}),Object(v.jsxs)("div",{className:"flex",children:[Object(v.jsx)("div",{style:{width:"200px",borderRight:"1px solid #999",height:"100%"},children:Object(v.jsxs)("div",{className:"frame",children:[Object(v.jsx)("h2",{children:"Start Sequence"}),Object(v.jsx)("div",{children:Object(v.jsx)("input",{type:"file",accept:".csv",maxLength:"1",onChange:d})}),Object(v.jsx)("br",{}),Object(v.jsx)("button",{onClick:function(){return n("BEGINSEQUENCE",null)},style:{backgroundColor:m?"lime":"lightgrey",padding:10,cursor:"pointer"},children:"Start"}),Object(v.jsx)("br",{}),Object(v.jsx)("br",{}),Object(v.jsx)(N,{title:"Run Abort Sequence",children:Object(v.jsx)("button",{onClick:function(){return n("ABORTSEQUENCE",t);var t},style:{backgroundColor:m?"tomato":"lightgrey",padding:10,cursor:"pointer"},children:"ABORT"})})]})}),Object(v.jsx)("div",{style:{overflow:"auto",width:"100%",height:"100%"},children:Object(v.jsxs)(rt.a,{stickyHeader:!0,"aria-label":"simple table",children:[Object(v.jsx)(st.a,{children:Object(v.jsxs)(ct.a,{children:[Object(v.jsx)(lt.a,{align:"center",children:"Command"}),Object(v.jsx)(lt.a,{align:"center",children:"LabJack"}),Object(v.jsx)(lt.a,{align:"center",children:"Value"})]})}),Object(v.jsxs)(ot.a,{children:[r&&Object(v.jsxs)(ct.a,{style:{background:"#94F690"},children:[Object(v.jsx)(lt.a,{component:"th",scope:"row",children:r.header}),Object(v.jsx)(lt.a,{align:"center",children:r.data.name&&r.data.name}),Object(v.jsx)(lt.a,{align:"center",children:r.data.name?r.data.pin:((r.time-a.data.time)/1e3).toFixed(4)})]}),i.map((function(t){return Object(v.jsxs)(ct.a,{children:[Object(v.jsx)(lt.a,{component:"th",scope:"row",children:t.header}),Object(v.jsx)(lt.a,{align:"center",children:void 0===t.data.name?"":t.data.name}),Object(v.jsx)(lt.a,{align:"center",children:void 0===t.data.name?t.data:t.data.pin})]})}))]})]})})]})]})}var ht=["state","emit"],ut=["state","emit"];function bt(t){return"".concat(26*t,"px")}function jt(t){var e=t.x,a=t.y,i=t.width,r=t.height,s=t.enabled;return Object(n.a)({position:"absolute",borderStyle:"solid",borderColor:"transparent",width:bt(i),height:bt(r),top:bt(a),left:bt(e)},s?{}:{cursor:"help"})}function pt(t){var e=t.state,a=t.emit,n=Object(j.a)(t,ht),i=null!==e.data&&e.data.labjacks[n.test_stand].digital[n.labjack_pin],r=jt(n),s={position:"absolute",margin:"auto",fontSize:"1rem",top:bt(n.y-1),left:bt(n.x-1)};return Object(v.jsxs)("div",{children:[e.data&&Object(v.jsxs)("div",{style:r,title:n.enabled?"":"Please enable the arming and manual control switches to toggle",children:[Object(v.jsx)(g.a,{checked:i,onChange:function(){return e.data.labjacks[n.test_stand].digital[n.labjack_pin]?a("CLOSE",{name:n.test_stand,pin:parseInt(n.labjack_pin)}):a("OPEN",{name:n.test_stand,pin:parseInt(n.labjack_pin)})},disabled:!n.enabled}),Object(v.jsxs)("label",{className:(i?"active":"inactive")+" control-label "+(n.enabled?"":"disabled"),children:[Object(v.jsx)("br",{}),i?"Open":"Closed"]})]}),Object(v.jsx)("h4",{style:s,children:n.title})]})}function mt(t){var e=t.state,a=(t.emit,Object(j.a)(t,ut)),i=jt(Object(n.a)({enabled:!0},a)),r=null,s=null;if(e.data){r=e.data.labjacks[a.test_stand].analog[a.labjack_pin];var c=X[a.sensorName];s=C(r,c.barMax,c.zero,c.span)}return s&&s>29.3918&&(i.backgroundColor="tomato"),Object(v.jsxs)("div",{style:i,children:[Object(v.jsx)("div",{children:a.title}),s&&Object(v.jsxs)("div",{children:[s.toFixed(1)," PSI"]}),r&&Object(v.jsxs)("div",{children:["(",r.toFixed(2),"V)"]})]})}function xt(t){var e=t.state,a=t.emit;return Object(v.jsx)(S,{title:"Control Panel",className:"panel control",children:Object(v.jsxs)("div",{className:"control-panel",children:[A.buttons.map((function(t){return Object(v.jsx)(pt,Object(n.a)(Object(n.a)(Object(n.a)({title:t.pin.test_stand.charAt(0)+" "+t.pin.abbrev+" "+t.pin.labjack_pin,state:e,emit:a},t.pin),t.position),{},{enabled:e.data&&e.data.arming_switch&&e.data.manual_switch}),t.pin.name)})),A.sensors.map((function(t){return Object(v.jsx)(mt,Object(n.a)(Object(n.a)(Object(n.a)({title:t.pin.abbrev,state:e,emit:a},t.pin),t.position),{},{sensorName:t.pin.abbrev}),t.pin.name)}))]})})}var ft=a(111),Ot=function(t){Object(l.a)(a,t);var e=Object(o.a)(a);function a(t){var n;return Object(r.a)(this,a),(n=e.call(this,t)).state={data:null,history:[],mostRecentWarning:{},showWarning:!1,wsAddress:localStorage.getItem("wsaddr")||"127.0.0.1",defaultWSAddress:"127.0.0.1",valveHistory:[]},n.emit=n.emit.bind(Object(c.a)(n)),n.connect(),n}return Object(s.a)(a,[{key:"componentDidMount",value:function(){var t=this;this.interval=setInterval((function(){return t.emit("PING")}),200),this.mounted=!0}},{key:"componentWillUnmount",value:function(){this.mounted=!1,clearInterval(this.interval)}},{key:"connect",value:function(){var t=this;this.socket&&this.socket.close();try{this.socket=new WebSocket("ws://".concat(this.state.wsAddress,":8888")),this.socket.onopen=function(t){return console.log("websocket connection established")},this.socket.onclose=function(e){setTimeout((function(){t.socket||t.connect()}),1e3)},this.socket.onmessage=function(e){if(t.mounted){var a=JSON.parse(e.data);switch(a.type){case"STATE":t.state.history.push(a.data),t.state.history.length>1e4&&(t.state.history=t.state.history.slice(5e3,-1)),t.setState({data:a.data,history:t.state.history});break;case"PING":t.setState({ping:(new Date).getTime()-a.data});break;case"VALVE":console.log(a.data),t.setState({valveHistory:[].concat(Object(i.a)(t.state.valveHistory),[Object(n.a)(Object(n.a)({},a.data),{},{time:parseInt(t.state.data.time)/1e3})])});break;default:console.error(a)}}}}catch(e){console.error(e)}}},{key:"emit",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this.socket&&this.socket.readyState===WebSocket.OPEN&&this.socket.send(JSON.stringify({command:{header:t,data:e},time:(new Date).getTime()}))}},{key:"render",value:function(){var t=this;return this.state.data&&this.state.data.latest_warning&&this.state.data.latest_warning.id!==this.state.mostRecentWarning.id&&(console.log(this.state.mostRecentWarning),this.setState({mostRecentWarning:this.state.data.latest_warning,showWarning:!0})),Object(v.jsxs)("div",{children:[Object(v.jsx)(_,{}),Object(v.jsxs)("div",{className:"panels-root",children:[Object(v.jsxs)("div",{className:"panel-row-1",children:[Object(v.jsx)(L,{state:this.state,emit:this.emit,that:this}),Object(v.jsx)(dt,{state:this.state,emit:this.emit})]}),Object(v.jsxs)("div",{className:"panel-row-2",children:[Object(v.jsx)(xt,{state:this.state,emit:this.emit}),Object(v.jsx)(Q,{state:this.state,emit:this.emit})]}),this.state.showWarning?Object(v.jsx)(ft.a,{onClose:function(){t.setState({showWarning:!1})},severity:"error",className:"alert",children:this.state.mostRecentWarning.message}):null]})]})}}]),a}(h.a.Component);b.a.render(Object(v.jsx)(h.a.StrictMode,{children:Object(v.jsx)(Ot,{})}),document.getElementById("root"))}},[[73,1,2]]]);
//# sourceMappingURL=main.7a454103.chunk.js.map