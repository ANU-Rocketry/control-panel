(this.webpackJsonpreactfront=this.webpackJsonpreactfront||[]).push([[0],{29:function(t){t.exports=JSON.parse('{"notice":"The labjack pin values are duplicated in the Python code, beware!","buttons":[{"pin":{"test_stand":"ETH","labjack_pin":14,"full_name":"Main Fuel (Ethanol) Valve","abbrev":"main","name":"ETH Main"},"position":{"width":2,"height":1,"x":11.5,"y":15}},{"pin":{"test_stand":"ETH","labjack_pin":12,"full_name":"Fuel (Ethanol) Fill Valve","abbrev":"fill","name":"ETH Fill"},"position":{"width":2,"height":1,"x":8,"y":13}},{"pin":{"test_stand":"ETH","labjack_pin":10,"full_name":"Fuel (Ethanol) Dump/Drain Valve","abbrev":"drain","name":"ETH Drain"},"position":{"width":2,"height":1,"x":4,"y":13}},{"pin":{"test_stand":"ETH","labjack_pin":8,"full_name":"Fuel (Ethanol) Tank Nitrogen Pressurisation Valve","abbrev":"pres","name":"ETH Pressurisation"},"position":{"width":2,"height":1,"x":8,"y":4}},{"pin":{"test_stand":"ETH","labjack_pin":19,"full_name":"Fuel (Ethanol) Tank Vent Valve","abbrev":"vent","name":"ETH Vent"},"position":{"width":2,"height":1,"x":11,"y":1}},{"pin":{"test_stand":"ETH","labjack_pin":17,"full_name":"Fuel (Ethanol) Line Nitrogen Purge Valve","abbrev":"purge","name":"ETH Purge"},"position":{"width":2,"height":1,"x":8,"y":17}},{"pin":{"test_stand":"LOX","labjack_pin":16,"full_name":"Main Oxidiser (LOX) Valve","abbrev":"main","name":"LOX Main"},"position":{"width":2,"height":1,"x":17.5,"y":15}},{"pin":{"test_stand":"LOX","labjack_pin":18,"full_name":"Oxidiser (LOX) Fill Valve","abbrev":"fill","name":"LOX Fill"},"position":{"width":2,"height":1,"x":21,"y":13}},{"pin":{"test_stand":"LOX","labjack_pin":9,"full_name":"Oxidiser (LOX) Dump/Drain Valve","abbrev":"drain","name":"LOX Drain"},"position":{"width":2,"height":1,"x":25,"y":13}},{"pin":{"test_stand":"LOX","labjack_pin":11,"full_name":"Oxidiser (LOX) Tank Nitrogen Pressurisation Valve","abbrev":"pres","name":"LOX Pressurisation"},"position":{"width":2,"height":1,"x":21,"y":4}},{"pin":{"test_stand":"LOX","labjack_pin":13,"full_name":"Oxidiser (LOX) Tank Vent Valve","abbrev":"vent","name":"LOX Vent"},"position":{"width":2,"height":1,"x":18,"y":1}},{"pin":{"test_stand":"LOX","labjack_pin":15,"full_name":"Oxidiser (LOX) Line Nitrogen Purge Valve","abbrev":"purge","name":"LOX Purge"},"position":{"width":2,"height":1,"x":21,"y":17}}],"sensors":[{"pin":{"test_stand":"LOX","labjack_pin":1,"sensorNumber":0,"full_name":"LOX Nitrogen Pressurant Sensor","abbrev":"lox_n2"},"position":{"width":5,"height":3,"x":25,"y":3}},{"pin":{"test_stand":"LOX","labjack_pin":3,"sensorNumber":1,"full_name":"LOX Tank Pressure Sensor","abbrev":"lox_tank"},"position":{"width":3,"height":4.5,"x":17,"y":7.5}},{"pin":{"test_stand":"ETH","labjack_pin":1,"sensorNumber":2,"full_name":"Ethanol Nitrogen Pressurant Sensor","abbrev":"eth_n2"},"position":{"width":5,"height":3,"x":1,"y":3}},{"pin":{"test_stand":"ETH","labjack_pin":3,"sensorNumber":3,"full_name":"Ethanol Tank Pressure Sensor","abbrev":"eth_tank"},"position":{"width":3,"height":4.5,"x":11,"y":7.5}}]}')},53:function(t,e,n){},60:function(t,e,n){"use strict";n.r(e);var a=n(8),i=n(9),r=n(19),s=n(14),c=n(17),o=n(31),l=n(30),u=n(0),h=n.n(u),d=n(15),b=n.n(d),m=(n(53),n(3)),j=n(80),f=n(6),p=n(89),x=n(1),O=["children","title"];function y(t){var e=t.children;return Object(x.jsx)("div",{style:{width:"100%",padding:"6px",height:"40px"},children:Object(x.jsx)("h1",{children:e})})}function g(){return Object(x.jsxs)("div",{className:"top-bar",children:[Object(x.jsx)("img",{src:"./logo.png",alt:"logo"}),Object(x.jsx)("h1",{children:"Test Stand Control Panel"})]})}function v(t){var e=t.children,n=t.title,i=Object(m.a)(t,O);return Object(x.jsxs)("div",Object(a.a)(Object(a.a)({className:"panel"},i),{},{children:[Object(x.jsx)(y,{children:n}),Object(x.jsx)(j.a,{style:{width:"100%",height:"calc(100% - 52px"},children:e})]}))}var k=Object(f.a)((function(t){return{root:{width:60,height:32,padding:1,display:"flex"},switchBase:{padding:2,color:t.palette.grey[500],"&$checked":{transform:"translateX(26px)",color:t.palette.common.white,"& + $track":{opacity:1,backgroundColor:t.palette.primary.main,borderColor:t.palette.primary.main}}},thumb:{width:28,height:28,boxShadow:"none"},track:{border:"1px solid ".concat(t.palette.grey[500]),borderRadius:8,opacity:1,backgroundColor:t.palette.common.white},checked:{}}}))(p.a);Object(f.a)((function(t){return{root:{position:"absolute",top:"-10px",left:"-10px",width:"6vw"}}}))(p.a);function w(t){var e=t.value,n=t.setValue;return Object(x.jsxs)("div",{className:"toggle-switch",style:{width:60},children:[Object(x.jsx)("span",{className:e?"inactive":"active",children:"Off"}),Object(x.jsx)(k,{checked:e,onChange:function(){return n(!e)}}),Object(x.jsx)("span",{className:e?"active":"inactive",style:{textAlign:"right",width:"100%",display:"block"},children:"On"})]})}function M(t){var e="";e=t.children?t.children:Object(x.jsx)(w,{value:t.switchValue,setValue:t.setSwitchValue});var n=t.label?{cursor:"help",borderBottom:"1px dotted #333"}:{};return Object(x.jsxs)("div",{className:"safety-card",children:[Object(x.jsx)("h2",{title:t.label,style:Object(a.a)(Object(a.a)({},n),t.style||{}),children:t.title}),e]})}var S={LINE_POWERED:"\u2705",BATTERY_POWERED:"\ud83d\udd0b",UNKNOWN:"\u2754"},_={LINE_POWERED:"Powered",BATTERY_POWERED:"Battery",UNKNOWN:"Unknown"};function N(t){var e=t.state,n=t.emit,a=t.sockStatus,i=t.that,r=null!==e.data&&e.data.arming_switch,s=null!==e.data&&e.data.manual_switch,c=null!==e.data&&e.data.data_logging,o=null===e.data?"UNKNOWN":e.data.UPS_status,l=S[o]+" "+_[o],u=a===WebSocket.OPEN?Object(x.jsx)("div",{style:{color:"green"},children:"Connected"}):Object(x.jsx)("div",{style:{color:"red"},children:" Disconnected"});return Object(x.jsx)(v,{title:"Safety",className:"panel safety",children:Object(x.jsxs)("div",{className:"flex",style:{justifyContent:"flex-start"},children:[Object(x.jsx)(M,{title:"Arming",label:"Controls if the state can change",isButton:"false",switchValue:r,setSwitchValue:function(t){return n("ARMINGSWITCH",t)}}),Object(x.jsx)(M,{title:"Manual",label:"Allow manual pin operation",isButton:"false",switchValue:s,setSwitchValue:function(t){return n("MANUALSWITCH",t)}}),Object(x.jsx)(M,{title:"Logging",label:"Logging data",isButton:"false",switchValue:c,setSwitchValue:function(t){return n("DATALOG",t)}}),Object(x.jsx)(M,{title:"Server IP",label:"Local IP address of the Raspberry Pi. Must be on the same network. If it's incorrect no new data will appear",children:Object(x.jsx)("input",{value:e.wsAddress,size:"10",onChange:function(t){i.setState({wsAddress:t.target.value},(function(){localStorage.setItem("wsaddr",t.target.value),i.connect()}))},placeholder:e.defaultWSAddress})}),Object(x.jsxs)(M,{title:"Ping",label:"Time delay to reach the server",style:{width:40},children:[e.ping?e.ping:"0","ms"]}),Object(x.jsxs)("div",{style:{paddingTop:6},children:[Object(x.jsx)(M,{title:"Status",children:u}),o&&Object(x.jsx)(M,{title:"UPS",children:l})]})]})})}var E=n(5),T=n(41),P=n(26);function L(t){if(t<0)return L(-t);if(0===t)return 0;var e=-Math.floor(Math.log10(t)),n=Math.log10(t)+e,a=[0,Math.log10(2),Math.log10(5),1],i=a[0],r=a[1],s=a[2],c=a[3],o=[Math.abs(n-i),Math.abs(n-r),Math.abs(n-s),Math.abs(n-c)],l=Math.min.apply(Math,o);return(l===o[0]?1:l===o[1]?2:l===o[2]?5:10)*Math.pow(10,-e)}function W(t,e){return parseFloat(t.toPrecision(e))}function C(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:3;if(0===t)return"0 "+e;for(var a=[["T",4],["G",3],["M",2],["K",1],["",0],["m",-1],["\u03bc",-2],["n",-3]],i=0;i<a.length;i++){var r=Math.pow(1e3,a[i][1]);if(Math.abs(t)>=r)return W(t/r,n)+" "+a[i][0]+e}return W(t/Math.pow(1e3,-4),n)+" p"+e}function A(t,e,n,a){for(var i=L((e-t)/n),r=[],s=Math.ceil(t/i)*i,c=Math.floor(e/i)*i,o=s;o<=c;o+=i)Math.abs(o)<1e-10&&(o=0),r.push({tick:o,label:C(o,a)});return r}function X(t,e,n){for(var a,i=0,r=n-1;i<=r;){var s=t(a=Math.floor((i+r)/2));if(s===e)return a;s<e?i=a+1:r=a-1}return r}function V(t,e){return t?e?[Math.min(t[0],e[0]),Math.max(t[1],e[1])]:t:e}function z(t,e){var n=Object(E.a)(t,2);return function(t,e){var n=Object(E.a)(t,2),a=n[0],i=n[1],r=Object(E.a)(e,2);return[a+(i-a)*r[0],i-(i-a)*(1-r[1])]}([n[0],n[1]],[-e,1+e])}function D(t,e,n){return Math.max(e,Math.min(n,t))}function F(t,e){var n=Object(E.a)(t,2),a=n[0],i=n[1],r=Object(E.a)(e,2),s=r[0],c=r[1];return a<s&&i>c?[s,c]:a<s?[s,s+(i-a)]:i>c?[c-(i-a),c]:[a,i]}function H(t){var e;try{e=t()}catch(n){if(!(n instanceof TypeError))throw n;e=void 0}return e}var I=function(){function t(e){Object(r.a)(this,t),this.capacity=e,this.array=new Float64Array(this.capacity),this.size=0,this.chunks=0}return Object(s.a)(t,[{key:"push",value:function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];try{this.array.set(e,this.size),this.size+=e.length,this.chunks++}catch(a){console.error(this,e),console.error(a)}}},{key:"shrink",value:function(){var t=new Float64Array(this.size);t.set(this.array.subarray(0,this.size)),this.array=t}},{key:"filterMapChunks",value:function(t,e){for(var n=[],a=0;a<this.chunks;a++)t(a)&&n.push(e(a));return n}}]),t}(),B=function(t){Object(o.a)(n,t);var e=Object(l.a)(n);function n(t){return Object(r.a)(this,n),e.call(this,4*t)}return Object(s.a)(n,[{key:"time",value:function(t){return this.array[4*t]}},{key:"mean",value:function(t){return this.array[4*t+1]}},{key:"min",value:function(t){return this.array[4*t+2]}},{key:"max",value:function(t){return this.array[4*t+3]}},{key:"updateDecimation",value:function(t){var e=t.chunks;this.chunks=Math.ceil(e/2),this.size=4*this.chunks;var n=this.size;if(0!==e)switch(e%2){case 0:this.array[n-4]=t.time(e-1),this.array[n-3]=(t.mean(e-2)+t.mean(e-1))/2,this.array[n-2]=Math.min(t.min(e-2),t.min(e-1)),this.array[n-1]=Math.max(t.max(e-2),t.max(e-1));break;case 1:this.array[n-4]=t.time(e-1),this.array[n-3]=t.mean(e-1),this.array[n-2]=t.min(e-1),this.array[n-1]=t.max(e-1)}}}]),n}(I),R=function(t){Object(o.a)(n,t);var e=Object(l.a)(n);function n(t){return Object(r.a)(this,n),e.call(this,2*t)}return Object(s.a)(n,[{key:"time",value:function(t){return this.array[2*t+0]}},{key:"mean",value:function(t){return this.array[2*t+1]}},{key:"min",value:function(t){return this.array[2*t+1]}},{key:"max",value:function(t){return this.array[2*t+1]}}]),n}(I),U=function(){function t(){Object(r.a)(this,t),this.n_bound=12,this.capacity=524288,this.arrays={},this.arrays[0]=new R(this.capacity);for(var e=1;e<=this.n_bound;e++)this.arrays[e]=new B(this.capacity>>e)}return Object(s.a)(t,[{key:"push",value:function(t,e){this.arrays[0].push(t,e);for(var n=1;n<=this.n_bound;n++)this.arrays[n].updateDecimation(this.arrays[n-1])}},{key:"sample",value:function(t,e){var n=this,a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:200,i=[Math.max(X((function(t){return n.arrays[0].time(t)}),t,this.arrays[0].chunks),0),Math.min(X((function(t){return n.arrays[0].time(t)}),e,this.arrays[0].chunks)+2,this.arrays[0].chunks)],r=i[1]-i[0],s=Math.min(this.n_bound,Math.max(0,1+Math.floor(Math.log(r/a+.01)/Math.log(2))))||0,c=[Math.max(X((function(t){return n.arrays[s].time(t)}),t,this.arrays[s].chunks),0),Math.min(X((function(t){return n.arrays[s].time(t)}),e,this.arrays[s].chunks)+2,this.arrays[s].chunks)],o=c[1]-c[0],l=new Array(o);l.min=1/0,l.max=-1/0;for(var u=0;u<o;u++)l[u]=[this.arrays[s].time(c[0]+u),this.arrays[s].mean(c[0]+u),this.arrays[s].min(c[0]+u),this.arrays[s].max(c[0]+u)],l.min=Math.min(l.min,l[u][2]),l.max=Math.max(l.max,l[u][3]);return l.decimated=s>0,l.getPoints=function(t,e,n){for(var a="",i=0;i<o;i++)a+="".concat(t(l[i][0]-n).toFixed(1),",").concat(Math.round(e(l[i][1]))," ");return a},l.getMinMaxPoints=function(t,e,n){for(var a="",i=0;i<o;i++)a+="".concat(t(l[i][0]-n).toFixed(1),",").concat(Math.round(e(l[i][2]))," ");for(var r=o-1;r>=0;r--)a+="".concat(t(l[r][0]-n).toFixed(1),",").concat(Math.round(e(l[r][3]))," ");return a},l}},{key:"samplePreview",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:200,n=this.arrays[0].chunks,a=Math.ceil(n/e),i=1/0,r=-1/0,s=this.arrays[0].filterMapChunks((function(t){return t%a===0||t===n-1}),(function(e){var n=t.arrays[0].mean(e);return i=Math.min(i,n),r=Math.max(r,n),[t.arrays[0].time(e),n]}));return s.min=i,s.max=r,s.getPoints=function(t,e,n){for(var a="",i=0;i<s.length;i++)a+="".concat(t(s[i][0]-n).toFixed(1),",").concat(Math.round(e(s[i][1]))," ");return a},s}},{key:"shrink",value:function(){for(var t=0;t<=this.n_bound;t++)this.arrays[t].shrink()}}]),t}(),G=function(){function t(){Object(r.a)(this,t),this.series=[new U],this.enabled=!0}return Object(s.a)(t,[{key:"push",value:function(t,e){isNaN(t)||isNaN(e)?this.series[this.series.length-1].arrays[0].chunks>0&&(this.series[this.series.length-1].shrink(),this.series.push(new U)):this.series[this.series.length-1].push(t,e)}},{key:"sample",value:function(t,e,n){var a=this.series.map((function(a){return a.sample(t,e,n)}));return a.totalLength=a.reduce((function(t,e){return t+e.length}),0),a.splitPointIndex=function(t){for(var e=0;e<a.length;e++){if(t<a[e].length)return[e,t];if((t-=a[e].length)<0)return[-1,-1]}},a.fromPointIndex=function(t){var e=a.splitPointIndex(t),n=Object(E.a)(e,2),i=n[0],r=n[1];return a[i][r]},a.min=Math.min.apply(Math,Object(i.a)(a.map((function(t){return t.min})))),a.max=Math.max.apply(Math,Object(i.a)(a.map((function(t){return t.max})))),a}},{key:"samplePreview",value:function(t){if(0===this.series.length||0===this.series[0].arrays[0].chunks)return[];var e=[this.minTime(),this.maxTime()];if(e[0]===e[1])return[];var n=this.series.filter((function(t){return t.arrays[0].chunks})).map((function(n){var a=(n.arrays[0].time(n.arrays[0].chunks-1)-n.arrays[0].time(0))/(e[1]-e[0]);return n.samplePreview(t*a)}));return n.min=Math.min.apply(Math,Object(i.a)(n.map((function(t){return t.min})))),n.max=Math.max.apply(Math,Object(i.a)(n.map((function(t){return t.max})))),n}},{key:"minTime",value:function(){var t=this;return H((function(){return t.series[0].arrays[0].time(0)}))}},{key:"maxTime",value:function(){for(var t=this.series.length-1;t>=0;t--)if(this.series[t].arrays[0].chunks>0)return this.series[t].arrays[0].time(this.series[t].arrays[0].chunks-1);return NaN}}]),t}(),q=function(){function t(e){Object(r.a)(this,t),this.series=e,this.keys=Array.from(Object.keys(this.series)),this.arrays=this.objectMap((function(t){return new G}))}return Object(s.a)(t,[{key:"objectMap",value:function(t){return this.keys.reduce((function(e,n){return e[n]=t(n),e}),{})}},{key:"minTime",value:function(){var t=this;return Math.min.apply(Math,Object(i.a)(this.keys.map((function(e){return t.arrays[e].minTime()})).filter((function(t){return t}))))}},{key:"sample",value:function(t,e){var n=this,a=this.objectMap((function(a){var r;return n.arrays[a].enabled&&(r=n.arrays[a]).sample.apply(r,Object(i.a)(t).concat([e]))}));return a.min=Math.min.apply(Math,Object(i.a)(this.keys.filter((function(t){return n.arrays[t].enabled})).map((function(t){return a[t].min})))),a.max=Math.max.apply(Math,Object(i.a)(this.keys.filter((function(t){return n.arrays[t].enabled})).map((function(t){return a[t].max})))),a}},{key:"samplePreview",value:function(t){var e=this,n=this.objectMap((function(n){return e.arrays[n].enabled&&e.arrays[n].samplePreview(t)}));return n.min=Math.min.apply(Math,Object(i.a)(this.keys.filter((function(t){return e.arrays[t].enabled})).map((function(t){return n[t].min})))),n.max=Math.max.apply(Math,Object(i.a)(this.keys.filter((function(t){return e.arrays[t].enabled})).map((function(t){return n[t].max})))),n}},{key:"toggleSeries",value:function(t){this.arrays[t].enabled=!this.arrays[t].enabled}}]),t}(),J=n(29),Y=["time"];function K(t){return J.buttons.filter((function(e){return e.pin.labjack_pin===t}))[0]}window.enablePageScroll=P.enablePageScroll,window.disablePageScroll=P.disablePageScroll;var Q=null,$=[-10,10],Z=function(t){return document.dispatchEvent(new CustomEvent("datalogger-new-data",{detail:t}))};var tt=function(t){var e=t.series,n=t.unit,r=(t.label,Array.from(Object.keys(e))),s=new q(e),c=[],o=function(){},l=function(){return requestAnimationFrame(o)};return document.addEventListener("datalogger-new-data",(function(t){var e,n=t.detail,a=Object(T.a)(r);try{for(a.s();!(e=a.n()).done;){var i=e.value;i in n&&s.arrays[i].push(n.time,n[i])}}catch(c){a.e(c)}finally{a.f()}l()})),document.addEventListener("datalogger-new-event",(function(t){var e=t.detail;c.push(Object(a.a)(Object(a.a)({},e),{},{key:c.length})),l()})),function(t){var l=t.currentSeconds,u=h.a.useRef(null);o=h.a.useReducer((function(t){return t+1}),0)[1];var d=600,b=450;l||(l=(new Date).getTime()/1e3);var j,f,p,O=s.minTime(),y=h.a.useState([-3]),g=Object(E.a)(y,2),v=g[0],k=g[1],w=function(t){if(1===t.length||t[1]>=l){var e=1===t.length?t[0]:t[0]-l,n=Math.min(-10,O-l);k([D(e,n,0)])}else t=[Math.min.apply(Math,Object(i.a)(t)),Math.max.apply(Math,Object(i.a)(t))],k([D(t[0],O,t[1]-.01),D(t[1],t[0],l)])},M=1===v.length?[l+v[0],l]:v,S=[M[0]-l,M[1]-l],_=s.sample(M,d),N=s.samplePreview(d);j=Q,f=V([_.min,_.max],$),p=.1;var T=z(Q=j?f?[j[0]+(f[0]-j[0])*p,j[1]+(f[1]-j[1])*p]:j:f,.2),L=[O,l],W=1,I=1,B=1,R=1,U=function(t){return W+t*(d-W-I)},G=function(t){return B+t*(400-B-R)},q=function(t){return(t-W)/(d-W-I)},J=function(t){return U((t-S[0])/(S[1]-S[0]))},K=function(t){return G(1-(t-T[0])/(T[1]-T[0]))},Z=function(t){return S[0]+q(t)*(S[1]-S[0])},tt=6,et=12,nt=function(t){return e=1-(t-N.min)/(N.max-N.min),tt+e*(50-tt-et);var e},at=function(t){return U(1-t/(Math.min(L[1]-10,L[0])-L[1]))},it=function(t){return(1-q(t))*(Math.min(L[1]-10,L[0])-L[1])},rt=A.apply(void 0,S.concat([4,"s"])),st=A.apply(void 0,Object(i.a)(T).concat([6,"psi"])),ct=h.a.useState(null),ot=Object(E.a)(ct,2),lt=ot[0],ut=ot[1],ht=r.map((function(t){if(!_[t]||!_[t].length)return null;var e=X((function(e){return _[t].fromPointIndex(e)[0]}),l+Z(lt),_[t].totalLength-1);if(-1===e)return null;var n=_[t].splitPointIndex(e),a=Object(E.a)(n,2),i=a[0],r=a[1];return r>=_[t][i].length-1||i<0||r<0?null:[i,r]})).map((function(t,e){if(null===t)return"";var a,i,s,c,o,u=Object(E.a)(t,2),h=u[0],d=u[1],b=_[r[e]],m=(a=b[h][d][0],i=b[h][d][1],s=b[h][d+1][0],c=b[h][d+1][1],o=l+Z(lt),i+(c-i)*(o-a)/(s-a));return"".concat(r[e],": ").concat(C(m,n))})).filter((function(t){return t.length})),dt=lt>U(1)-200,bt=h.a.useState(!1),mt=Object(E.a)(bt,2),jt=mt[0],ft=mt[1],pt=h.a.useState(null),xt=Object(E.a)(pt,2),Ot=xt[0],yt=xt[1],gt=function(t){return t.clientX-H((function(){return u.current.getBoundingClientRect().left}))},vt=c.map((function(t){var e=t.time,n=Object(m.a)(t,Y);return Object(a.a)({x:J(e-l)},n)})).filter((function(t){var e=t.x;return e>=U(0)-10&&e<=U(1)})),kt=M[1]-M[0]<15;h.a.useEffect((function(){document.body.addEventListener("mouseup",(function(){ft(!1),yt(null),At(!1),Dt(null),_t(!1),Pt(null)}))}),[]);var wt=h.a.useState(!1),Mt=Object(E.a)(wt,2),St=Mt[0],_t=Mt[1],Nt=h.a.useState(null),Et=Object(E.a)(Nt,2),Tt=Et[0],Pt=Et[1],Lt=h.a.useState(!1),Wt=Object(E.a)(Lt,2),Ct=Wt[0],At=Wt[1],Xt=h.a.useState(null),Vt=Object(E.a)(Xt,2),zt=Vt[0],Dt=Vt[1],Ft=function(t,e){_t(!0),Pt(e)},Ht=function(t){var e=gt(t);if(Ct){var n=Object(E.a)(zt,2),a=n[0],r=n[1],s=it(e)-a,c=[r[0]+s,r[1]+s];w(F(c,L))}if(St){var o=Tt,u=Object(i.a)(M);u[o]=D(l+it(e),Math.min(L[1]-10,L[0]),L[1]),0===o?u[0]=Math.min(u[1]-.01,u[0]):u[1]=Math.max(u[0]+.01,u[1]),w(u)}};return Object(x.jsxs)("div",{onMouseMove:function(t){return Ct?Ht(t):function(t){var e=gt(t);if(ut(e),jt){var n=Object(E.a)(Ot,2),a=n[0],i=n[1],r=Z(a)-Z(e),s=[i[0]+r,i[1]+r];s=F(s,V(L,[l-10,l])),w(s)}}(t)},children:[Object(x.jsxs)("svg",{viewBox:"0 0 ".concat(d," ").concat(400),xmlns:"http://www.w3.org/2000/svg",width:d,height:400,style:{userSelect:"none",fontFamily:"sans-serif",display:"block"},ref:u,onMouseOver:function(){return Object(P.disablePageScroll)()},onMouseOut:function(t){var e=u.current.getBoundingClientRect();Object(P.enablePageScroll)(),(t.clientX<e.left||t.clientX>e.right||t.clientY<e.top||t.clientY>e.bottom)&&ut(null)},onMouseDown:function(t){ft(!0),yt([gt(t),M])},onWheel:function(t){var e=t.deltaX+t.deltaY,n=1===v.length?M[1]:lt?l+Z(lt):(M[0]+M[1])/2,a=Math.max(n+(M[0]-n)*Math.pow(1.001,e),Math.min(L[0]+.01,l-10)),i=Math.min(n+(M[1]-n)*Math.pow(1.001,e),L[1]);w([Math.min(a,i-.01),i])},children:[rt.map((function(t){var e=t.tick;t.label;return Object(x.jsx)("line",{x1:J(e),y1:G(1),x2:J(e),y2:G(0),stroke:"#ddd"},e)})),Object(x.jsx)("line",{x1:0,y1:G(1),x2:d,y2:G(1),stroke:"#888",strokeWidth:"2"}),st.map((function(t){var e=t.tick;t.label;return Object(x.jsx)("line",{x1:U(0),y1:K(e),x2:U(1),y2:K(e),stroke:"#ddd"},e)})),Object(x.jsx)("line",{x1:U(0),y1:0,x2:U(0),y2:b,stroke:"#888",strokeWidth:"2"}),vt.map((function(t,e){var n=t.x,a=t.label,i=t.key;return Object(x.jsxs)("g",{children:[Object(x.jsx)("line",{x1:n,y1:G(0),x2:n,y2:G(1),stroke:"#333",strokeWidth:"1",strokeDasharray:"2 4"}),kt&&Object(x.jsx)("text",{x:n+5,y:G(1)-e%10*12-20,textAnchor:"start",alignmentBaseline:"text-after-edge",fontSize:"12",children:a})]},i)})),r.map((function(t){return Object(x.jsxs)("g",{children:[_[t]&&_[t].map((function(n,a){return n.length&&n.decimated&&Object(x.jsx)("polygon",{points:n.getMinMaxPoints(J,K,l),fill:e[t].color,opacity:"0.5",stroke:"none",strokeWidth:"0"},a)})),_[t]&&_[t].map((function(n,a){return n.length&&Object(x.jsx)("polyline",{points:n.getPoints(J,K,l),fill:"none",stroke:e[t].color,strokeWidth:"1"},a)}))]},t)})),rt.map((function(t){var e=t.tick,n=t.label;return J(e)-U(0)>40&&Object(x.jsx)("text",{x:J(e),y:G(1)-2,textAnchor:"middle",alignmentBaseline:"after-edge",fontSize:"12",children:n},e)})),st.map((function(t){var e=t.tick,n=t.label;return G(1)-K(e)>20&&Object(x.jsx)("text",{x:U(0)+2,y:K(e),textAnchor:"start",alignmentBaseline:"after-edge",fontSize:"12",children:n},e)})),ht.length&&lt>U(0)&&Object(x.jsxs)("g",{children:[Object(x.jsx)("line",{x1:lt,y1:G(0),x2:lt,y2:G(1),stroke:"black",strokeWidth:"1"}),ht.map((function(t,e){return Object(x.jsx)("text",{x:Math.max(50,Math.min(lt+(dt?-5:5),U(1)-100)),y:G(0)+18+20*e,textAnchor:dt?"end":"start",alignmentBaseline:"text-after-edge",fontSize:"12",children:t},e)}))]}),r.map((function(t,n){return Object(x.jsxs)("g",{onClick:function(e){return s.toggleSeries(t)},cursor:"pointer",children:[Object(x.jsx)("rect",{x:500,y:20*n,width:"100",height:"20",fill:"transparent"}),Object(x.jsx)("circle",{r:"4",fill:s.arrays[t].enabled?e[t].color:"lightgrey",cx:590,cy:12+20*n}),Object(x.jsx)("text",{fontSize:"12",x:580,textAnchor:"end",alignmentBaseline:"middle",fill:s.arrays[t].enabled?e[t].color:"lightgrey",y:13+20*n,children:t})]},t)}))]}),Object(x.jsxs)("svg",{viewBox:"0 0 ".concat(d," ",50),xmlns:"http://www.w3.org/2000/svg",width:d,height:50,style:{userSelect:"none",fontFamily:"sans-serif",display:"block"},onMouseOut:function(t){Object(P.enablePageScroll)()},onMouseMove:Ht,onMouseDown:function(t){At(!0),Dt([it(gt(t)),M])},children:[Object(x.jsx)("rect",{x:at(S[0]),y:-2,width:at(S[1])-at(S[0]),height:54,fill:"#eee",stroke:"#999",strokeWidth:"2"}),r.map((function(t){return Object(x.jsx)("g",{children:N[t]&&N[t].map((function(n,a){return n.length&&Object(x.jsx)("polyline",{points:n.getPoints(at,nt,l),fill:"none",stroke:e[t].color,strokeWidth:"1"},a)}))},t)})),Object(x.jsxs)("text",{x:"2",y:"50",alignmentBaseline:"text-after-edge",textAnchor:"start",fontSize:"12",fill:"grey",children:[Math.max(10,Math.round(L[1]-L[0])),"s ago"]}),Object(x.jsx)("text",{x:598,y:"50",alignmentBaseline:"text-after-edge",textAnchor:"end",fontSize:"12",fill:"grey",children:"now"}),Object(x.jsx)("rect",{x:at(S[1])-4,y:10,width:8,height:30,fill:"#999",stroke:"none",strokeWidth:"0",rx:"4"}),Object(x.jsx)("rect",{x:at(S[0])-4,y:10,width:8,height:30,fill:"#999",stroke:"none",strokeWidth:"0",rx:"4"}),Object(x.jsx)("rect",{x:at(S[1])-6,onMouseDown:function(t){return Ft(0,1)},y:"0",width:"16",height:"50",fill:"transparent",stroke:"none",strokeWidth:"0",cursor:"col-resize"}),Object(x.jsx)("rect",{x:at(S[0])-10,onMouseDown:function(t){return Ft(0,0)},y:"0",width:"16",height:"50",fill:"transparent",stroke:"none",strokeWidth:"0",cursor:"col-resize"}),1!==v.length&&Object(x.jsxs)("g",{cursor:"pointer",onClick:function(){return w([v[0]-v[1]])},children:[Object(x.jsx)("rect",{x:584,y:"2",width:"15",height:"18",fill:"#999",stroke:"none",strokeWidth:"0",rx:"4"}),Object(x.jsx)("polyline",{points:"".concat(589,",6 ").concat(595,",11 ").concat(589,",16"),fill:"none",stroke:"#fff",strokeWidth:"2"})]})]}),Object(x.jsx)("button",{onClick:function(){var t=u.current,e=(new XMLSerializer).serializeToString(t),n=new Blob([e],{type:"image/svg+xml"}),a=URL.createObjectURL(n),i=document.createElement("a");i.href=a,i.download="graph.svg",i.click()},children:"Download SVG"})]})}}({unit:"psi",series:{"LOX Tank":{color:"#000"},"LOX N2":{color:"#f00"},"ETH Tank":{color:"#3d6"},"ETH N2":{color:"#09f"}}});function et(t){var e=t.state;return Object(x.jsx)(v,{title:"Graphs",className:"panel graphs",children:Object(x.jsx)(tt,{currentSeconds:H((function(){return e.data.time}))})})}var nt=n(36),at=n.n(nt),it=n(42),rt=n(82),st=n(83),ct=n(84),ot=n(85),lt=n(86);function ut(t){return Object(x.jsxs)(rt.a,{style:t.inFlight?{background:"#94F690"}:{},children:[Object(x.jsx)(st.a,{align:"right",children:t.name[0]+t.name.substring(1).toLowerCase()}),Object(x.jsx)(st.a,{children:t.stand?K(t.pin).pin.name:((t.inFlight?t.remaining:t.ms)/1e3).toFixed(1)+"s"})]})}function ht(t){var e=t.state,n=t.emit,i=e.data&&e.data.current_sequence||[],r=null===e.data?null:e.data.command_in_flight,s=h.a.useState(!1),c=Object(E.a)(s,2),o=(c[0],c[1],function(){var t=Object(it.a)(at.a.mark((function t(){return at.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n("SETSEQUENCE",prompt("Enter a sequence name"));case 2:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}()),l=e.data&&e.data.arming_switch;return Object(x.jsx)(v,{title:"Sequences",children:Object(x.jsxs)("div",{className:"flex",children:[Object(x.jsx)("div",{style:{width:"200px",borderRight:"1px solid #999",height:"100%"},children:Object(x.jsxs)("div",{className:"frame",children:[Object(x.jsx)("h2",{children:"Start"}),Object(x.jsx)("div",{children:Object(x.jsx)("button",{onClick:o,disabled:!l,children:"Choose sequence"})}),Object(x.jsx)("br",{}),Object(x.jsx)("button",{onClick:function(){return n("BEGINSEQUENCE",null)},style:{backgroundColor:l?"lime":"lightgrey",padding:10,cursor:l&&"pointer"},disabled:!l,children:"Start"}),Object(x.jsx)("br",{}),Object(x.jsx)("br",{}),Object(x.jsx)(M,{title:"Abort",children:Object(x.jsx)("button",{onClick:function(){return n("ABORTSEQUENCE",t);var t},style:{backgroundColor:l?"tomato":"lightgrey",padding:10,cursor:l&&"pointer"},disabled:!l,children:"ABORT"})})]})}),Object(x.jsx)("div",{style:{overflow:"auto",width:"100%",height:"100%"},children:Object(x.jsxs)(ct.a,{stickyHeader:!0,"aria-label":"simple table",style:{tableLayout:"fixed"},children:[Object(x.jsx)(ot.a,{children:Object(x.jsxs)(rt.a,{children:[Object(x.jsx)(st.a,{align:"right",style:{width:100},children:"Command"}),Object(x.jsx)(st.a,{children:"Parameter"})]})}),Object(x.jsxs)(lt.a,{children:[r&&Object(x.jsx)(ut,Object(a.a)({inFlight:!0},r)),i.map((function(t){return Object(x.jsx)(ut,Object(a.a)({},t))}))]})]})})]})})}function dt(t,e,n,a){return 14.504*((t/120-n/1e3)/(a/1e3)*e)}var bt={eth_tank:{barMax:100,zero:3.99,span:16.02},lox_tank:{barMax:100,zero:3.99,span:16.04},eth_n2:{barMax:250,zero:4,span:16},lox_n2:{barMax:250,zero:4,span:16}};function mt(t,e){return 14.504*(e/2.4*(t-.48))}var jt={time:NaN,"LOX Tank":NaN,"LOX N2":NaN,"ETH Tank":NaN,"ETH N2":NaN},ft=["state","emit"],pt=["state","emit"];function xt(t){return 26*t}function Ot(t){var e=t.x,n=t.y,i=t.width,r=t.height,s=t.enabled;return Object(a.a)({position:"absolute",borderStyle:"solid",borderColor:"transparent",width:xt(i),height:xt(r),top:xt(n),left:xt(e)},s?{}:{cursor:"help"})}function yt(t){var e=t.state,n=t.emit,a=Object(m.a)(t,ft),i=null!==e.data&&e.data.labjacks[a.test_stand].digital[a.labjack_pin],r=Ot(a),s={position:"absolute",margin:"auto",fontSize:"1rem",top:xt(a.y-1),left:xt(a.x-1)-6,width:100,textAlign:"center"};return Object(x.jsxs)("div",{children:[e.data&&Object(x.jsxs)("div",{style:r,title:a.enabled?"":"Please enable the arming and manual control switches to toggle",children:[Object(x.jsx)(p.a,{checked:i,onChange:function(){return e.data.labjacks[a.test_stand].digital[a.labjack_pin]?n("CLOSE",{name:a.test_stand,pin:parseInt(a.labjack_pin)}):n("OPEN",{name:a.test_stand,pin:parseInt(a.labjack_pin)})},disabled:!a.enabled}),Object(x.jsxs)("label",{className:(i?"active":"inactive")+" control-label "+(a.enabled?"":"disabled"),children:[Object(x.jsx)("br",{}),i?"Open":"Closed"]})]}),Object(x.jsx)("h4",{style:s,children:a.title})]})}function gt(t){var e=t.state,n=(t.emit,Object(m.a)(t,pt)),i=Ot(Object(a.a)({enabled:!0},n)),r=null,s=null;if(e.data){r=e.data.labjacks[n.test_stand].analog[n.labjack_pin];var c=bt[n.sensorName];s=dt(r,c.barMax,c.zero,c.span)}return s&&s>29.3918&&(i.backgroundColor="tomato"),Object(x.jsxs)("div",{style:i,children:[Object(x.jsx)("div",{children:n.title}),s&&Object(x.jsxs)("div",{children:[s.toFixed(1)," PSI"]}),r&&Object(x.jsxs)("div",{children:["(",r.toFixed(2),"V)"]})]})}function vt(t){var e=t.state,n=t.emit;return Object(x.jsx)(v,{title:"Control Panel",className:"panel control",children:Object(x.jsxs)("div",{className:"control-panel",children:[J.buttons.map((function(t){return e.data&&Object(x.jsx)(yt,Object(a.a)(Object(a.a)(Object(a.a)({title:t.pin.test_stand.charAt(0)+" "+t.pin.abbrev,state:e,emit:n},t.pin),t.position),{},{enabled:e.data&&e.data.arming_switch&&e.data.manual_switch}),t.pin.name)})),J.sensors.map((function(t){return e.data&&Object(x.jsx)(gt,Object(a.a)(Object(a.a)(Object(a.a)({title:t.pin.abbrev,state:e,emit:n},t.pin),t.position),{},{sensorName:t.pin.abbrev}),t.pin.name)}))]})})}var kt=n(88),wt=n(87),Mt=function(t){Object(o.a)(n,t);var e=Object(l.a)(n);function n(t){var a;return Object(r.a)(this,n),(a=e.call(this,t)).state={data:null,mostRecentWarning:{},showWarning:!1,wsAddress:localStorage.getItem("wsaddr")||"192.168.0.5",defaultWSAddress:"192.168.0.5",events:[],socketStatus:-1},a.emit=a.emit.bind(Object(c.a)(a)),a.connect(),a}return Object(s.a)(n,[{key:"componentDidMount",value:function(){var t=this;this.interval=setInterval((function(){return t.emit("PING")}),200),this.mounted=!0}},{key:"componentWillUnmount",value:function(){this.mounted=!1,clearInterval(this.interval)}},{key:"pushWarning",value:function(t,e){(!this.state.mostRecentWarning||this.state.mostRecentWarning.time!==t&&this.state.mostRecentWarning.message!==e)&&this.setState({mostRecentWarning:{time:t,message:e},showWarning:!0})}},{key:"updateSocketStatus",value:function(){if(this.socket){var t={socketStatus:this.socket.readyState};this.socket.readyState!==WebSocket.OPEN&&this.pushWarning((new Date).getTime(),"Server connection lost"),this.setState(t)}}},{key:"connect",value:function(){var t=this;this.socket&&this.socket.close();try{this.socket=new WebSocket("ws://".concat(this.state.wsAddress,":8888")),this.updateSocketStatus(),this.socket.onopen=function(e){console.log("websocket connection established"),t.updateSocketStatus()},this.socket.onclose=function(e){t.updateSocketStatus(),t.socket=null,console.log("websocket connection lost. reconnecting..."),Z(jt),setTimeout((function(){t.socket||t.connect()}),1e3)},this.socket.onmessage=function(e){if(t.mounted){t.updateSocketStatus();var n,r,s=JSON.parse(e.data);switch(s.type){case"STATE":s.data.time=parseInt(s.data.time)/1e3;var c=H((function(){return t.state.data.time}));s.data.time-c>1&&Z(jt),Z({time:(r=s.data).time,"LOX Tank":dt(r.labjacks.LOX.analog[3],bt.lox_tank.barMax,bt.lox_tank.zero,bt.lox_tank.span),"LOX N2":mt(r.labjacks.LOX.analog[1],250),"ETH Tank":dt(r.labjacks.ETH.analog[3],bt.eth_tank.barMax,bt.eth_tank.zero,bt.eth_tank.span),"ETH N2":mt(r.labjacks.ETH.analog[1],250)}),t.setState({data:s.data}),s.data.latest_warning&&t.pushWarning(s.data.latest_warning[0],s.data.latest_warning[1]);break;case"PING":t.setState({ping:(new Date).getTime()-s.data});break;case"VALVE":var o=s.time/1e3,l=K(s.data.pin).pin,u=("CLOSE"===s.data.header?"Closed":"Opened")+" "+l.test_stand+" "+l.abbrev;n={time:o,label:u},document.dispatchEvent(new CustomEvent("datalogger-new-event",{detail:n})),t.setState({events:[].concat(Object(i.a)(t.state.events),[Object(a.a)(Object(a.a)({},s.data),{},{label:u,time:o})])});break;default:console.error(s)}}}}catch(e){console.error(e)}}},{key:"emit",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this.socket&&this.socket.readyState===WebSocket.OPEN&&this.socket.send(JSON.stringify({header:t,data:e,time:(new Date).getTime()}))}},{key:"render",value:function(){var t=this;return Object(x.jsxs)("div",{children:[Object(x.jsx)(g,{}),Object(x.jsxs)("div",{className:"panels-root",children:[Object(x.jsxs)("div",{className:"panel-row-1",children:[Object(x.jsx)(N,{state:this.state,emit:this.emit,sockStatus:this.state.socketStatus,that:this}),Object(x.jsx)(ht,{state:this.state,emit:this.emit})]}),Object(x.jsxs)("div",{className:"panel-row-2",children:[Object(x.jsx)(vt,{state:this.state,emit:this.emit}),Object(x.jsx)(et,{state:this.state,emit:this.emit})]}),this.state.showWarning&&Object(x.jsx)(kt.a,{open:!0,onClose:function(){return t.setState({showWarning:!1})},message:this.state.mostRecentWarning.message,action:Object(x.jsx)(wt.a,{onClick:function(){return t.setState({showWarning:!1})},style:{color:"white",textTransform:"none",textDecoration:"underline"},children:"Dismiss"})})]})]})}}]),n}(h.a.Component);b.a.render(Object(x.jsx)(h.a.StrictMode,{children:Object(x.jsx)(Mt,{})}),document.getElementById("root"))}},[[60,1,2]]]);
//# sourceMappingURL=main.9add5a42.chunk.js.map