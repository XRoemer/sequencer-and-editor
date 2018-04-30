function create_btn(x,y,font_size,name,fkt) {
  var btn = document.createElement("BUTTON");
  var t = document.createTextNode('');
  btn.appendChild(t);
  btn.onclick = fkt
  btn.id = name
  btn.style.position = 'absolute'
  btn.style.top = y
  btn.style.left = x
  var size = 12
  btn.style.height = 12
  btn.style.width = 8

  return btn
}

function create_label (x,y,txt,font_size, id) {
  var newlabel = document.createElement("LABEL");
  newlabel.style.left = x.toString() + 'px'
  newlabel.style.top = y.toString() + 'px'
  newlabel.style.position = "absolute"
  newlabel.innerHTML = txt;
  newlabel.id = id
  newlabel.style.fontSize = font_size.toString() + 'px'
  return newlabel
}

function create_nr(x, y, _width, _min, _max, _step, fkt, def, wheel_fkt, var_name) {
  var input = document.createElement("input");
  input.type = "number";
  input.name = "points"
  input.min = _min
  input.max = _max
  input.step = _step
  input.value = def ? def : 0
  input.onchange = fkt
  input.style = "position:absolute; font-size:11px; top:" + y.toString() + "px; left:" + x.toString() + "px; max-width:" + _width.toString() + "px"
  if (wheel_fkt){
    input.addEventListener("wheel", function(e) {
      input.var_name = var_name
      wheel_fkt(e)
    }, false);
  }
  return input
}

function create_select(x, y, fkt, id_name) {
  var input = document.createElement("select");
  input.type = "select";
  input.onchange = fkt
  input.id = id_name
  input.style = "position: absolute; width: 100; top:" + y.toString() + "px; left:" + x.toString() + "px;"
  return input
}

function resp_quant() {
  lbl = document.getElementById('quant')
  quant = Math.pow(2,Number(this.id))
  use_triplets ? tri = ' triplets' : tri = ' norm'
  lbl.innerHTML = "1/" + quant.toString() + tri
  set_widths_and_heights()
  set_quantisation()
}
function set_bars(e) {
  amount_bars = e.srcElement.valueAsNumber
  var data = 'settings amount_bars ' + amount_bars
  send_data(data, window.win_nr)
}
function set_micro(e) {
  micro = e.srcElement.valueAsNumber
  var data = 'settings micro ' + micro
  send_data(data, window.win_nr)
}
function resp_use_triplets() {
  use_triplets = this.checked
  set_widths_and_heights()
  set_quantisation()
  lbl = document.getElementById('quant')
  tri = use_triplets ? ' triplets' : ' norm'
  lbl.innerHTML = "1/" + quant.toString() + tri

}

function resp_use_quant() {
  use_quant = this.checked
}
function call_settings(e) {
  load_scripts_otf({fkt:'open_settings',scripts:['init/settings'],args:e})
}

function call_midi(e) {
  var x = e.screenX - 190
  var y = e.screenY + 60
  open_win(x,y,390,220,'midi_win',"midi/midi.html", create_midi_dialog)
}
function call_test() {
  load_scripts_otf({fkt:'test',scripts:['test/test'],args:[]})
}

function create_radios(x,y,amount,fkt) {
  var container = document.createElement("div");
  container.style.position = 'absolute'
  container.style.left = x.toString() + 'px'
  container.style.top = y.toString() + 'px'

  for(var i=0; i< amount; i++) {
    var radio = document.createElement("INPUT");
    radio.type = "radio"
    radio.name = fkt.toString()
    radio.id = i
    radio.style ="margin: 0px 0px 0px 0px"
    radio.setAttribute("padding", 0);
    radio.onclick = fkt
    container.appendChild(radio)
  }
  return container
}

function create_checkbox(x,y,name,fkt,variable) {
  var cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.onclick = fkt
  cb.id = name
  cb.style.position = 'absolute'
  cb.style.top = y
  cb.style.left = x
  variable ? cb.checked = variable : cb.checked = false

  return cb
}

function create_stroke(x1,y1,x2,y2,w,col,id) {
  var c=document.getElementById("canvas_bg");
  var ctx=c.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = w;
  ctx.strokeStyle = col
  ctx.stroke();
}

function create_stroke_svg(x,y,w,h, stroke_w,col,id) {
  var path = document.createElementNS("http://www.w3.org/2000/svg", 'path')
  var str = 'M 0 0 L 0 ' + win_h
  path.setAttributeNS(null, "d", str);

  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.style.stroke = col
  svg.setAttributeNS(null, "stroke-width", stroke_w);
  svg.style.position="absolute"
  svg.style.width = w
  svg.style.height = h
  svg.style.left = x
  svg.style.top = y
  svg.id = id
  svg.appendChild(path);
  return svg
}
function create_stroke2(x1,y1,x2,y2,w,col,el) {
  var c=document.getElementById(el);
  var ctx=c.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = w;
  ctx.stroke();
}

function create_triad(x,y,w,h, stroke_w,col,id,fill,str) {
  if (fill == null) {fill = 'rgb(128,0,64)'}
  if (str == null) {str = 'M 7.5 20 L 0 0 L 15 0 Z'}

  var path = document.createElementNS("http://www.w3.org/2000/svg", 'path')
  path.setAttributeNS(null, "d", str);
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.style.stroke = col
  svg.style.fill = fill
  svg.setAttributeNS(null, "stroke-width", stroke_w);
  svg.setAttributeNS(null, "z-index", 30);
  svg.style.position="absolute"
  svg.style.width = w
  svg.style.height = h
  svg.style.left = x
  svg.style.top = y
  svg.id = id
  svg.appendChild(path);
  return svg
}

function create_play_btn(x,y,w,h, stroke_w,str,id,classes) {
  var path = document.createElementNS("http://www.w3.org/2000/svg", 'path')
  var str = str
  path.setAttributeNS(null, "d", str);

  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttributeNS(null, "stroke-width", stroke_w);
  svg.setAttributeNS(null, "z-index", 30);
  svg.setAttribute("class", classes)
  svg.style.position="absolute"
  svg.style.width = w
  svg.style.height = h
  svg.style.left = x
  svg.style.top = y
  svg.id = id
  svg.appendChild(path);
  return svg
}


play_btn_str = "m 205.846,158.266 -86.557,49.971 c -1.32,0.765 -2.799,1.144 " +
"-4.272,1.144 -1.473,0 -2.949,-0.379 -4.274,-1.144 -2.64,-1.525 " +
"-4.269,-4.347 -4.269,-7.402 V 100.89 c 0,-3.053 1.631,-5.88 " +
"4.269,-7.402 2.648,-1.528 5.906,-1.528 8.551,0 l 86.557,49.974 " +
"c 2.645,1.53 4.274,4.352 4.269,7.402 0,3.052 -1.626,5.877 -4.274,7.402 z"

back_btn_str = "m 217.343,203.764 c 0,3.704 -1.979,7.132 -5.187,8.982 -1.605,0.926 " +
"-3.4,1.393 -5.187,1.393 -1.792,0 -3.582,-0.467 -5.187,-1.393 l -81.103," +
"-46.823 c -0.993,-0.573 -1.854,-1.312 -2.594,-2.153 v 35.955 c 0,9.498 " +
"-7.7,17.198 -17.198,17.198 -9.498,0 -17.198,-7.7 -17.198,-17.198 v " +
"-89.078 h 0.002 c 0,-9.498 7.7,-17.198 17.198,-17.198 9.498,0 17.198,7.7 " +
"17.198,17.198 v 39.465 c 0.739,-0.84 1.6,-1.58 2.594,-2.155 l 81.1," +
"-46.823 c 3.211,-1.854 7.164,-1.854 10.375,0 3.208,1.852 5.187,5.278 " +
"5.187,8.984 v 93.646 z"

stop_btn_str = "m 196.63,210.605 h -93.26 c -7.706,0 -13.974,-6.269 -13.974,-13.974 " +
"v -93.259 c 0,-7.706 6.269,-13.974 13.974,-13.974 h 93.259 c 7.706," +
"0 13.974,6.269 13.974,13.974 v 93.259 h 0.001 c 0,7.706 -6.268,13.974 -13.974,13.974 z"

pause_btn_str = "m 134.41,194.538 c 0,9.498 -7.7,17.198 -17.198,17.198 -9.498,0 " +
"-17.198,-7.7 -17.198,-17.198 V 105.46 c 0,-9.498 7.7,-17.198 " +
"17.198,-17.198 9.498,0 17.198,7.7 17.198,17.198 z m 64.545,0 c " +
"0,9.498 -7.701,17.198 -17.198,17.198 -9.498,0 -17.198,-7.7 " +
"-17.198,-17.198 V 105.46 c 0,-9.498 7.7,-17.198 17.198,-17.198" +
" 9.498,0 17.198,7.7 17.198,17.198 z"

loop_btn_str = "m 230.091,172.444 c -9.921,37.083 -43.801,64.477 -83.969,64.477 " +
"-47.93,0 -86.923,-38.99 -86.923,-86.923 0,-47.933 38.99,-86.92 " +
"86.923,-86.92 21.906,0 41.931,8.157 57.228,21.579 l -13.637,23.623 " +
"c -11,-11.487 -26.468,-18.664 -43.594,-18.664 -33.294,0 -60.38,27.088 " +
"-60.38,60.38 0,33.294 27.085,60.38 60.38,60.38 25.363,0 47.113," +
"-15.728 56.038,-37.937 h -20.765 l 36.168,-62.636 36.166,62.641 h -23.635 z"

bounds_btn_str = "m 70.75,90.24023 c -1.4415,0 -2.882328,0.37269 -4.173828,1.11719 " +
"-2.584,1.488 -4.169922,4.25152 -4.169922,7.22852 0,55.34029 0.31608," +
"53.40689 0,102.60351 0,2.98 1.588875,5.73757 4.171875,7.22657 " +
"1.292,0.744 2.731875,1.12304 4.171875,1.12304 1.44,0 2.880922," +
"-0.37904 4.169922,-1.12304 l 59.533198,-51.30079 c 2.583,-1.488 " +
"4.17488,-4.24851 4.17188,-7.22851 0.01,-2.978 -1.58497,-5.74056 " +
"-4.16797,-7.22656 L 74.925781,91.35742 C 73.634281,90.61292 72.1915," +
"90.24023 70.75,90.24023 Z m 160.26758,0.11329 c -1.44,0 -2.88288," +
"0.37904 -4.17188,1.12304 l -59.53125,51.30078 c -2.583,1.488 " +
"-4.17682,4.24852 -4.17383,7.22852 -0.01,2.978 1.58497,5.73861 " +
"4.16797,7.22461 l 59.53321,51.30469 c 2.583,1.489 5.76465,1.489 " +
"8.34765,0 2.584,-1.488 4.17188,-4.25152 4.17188,-7.22852 0,-55.34029 " +
"-0.31608,-53.40689 0,-102.60352 0,-2.98 -1.59083,-5.73756 " +
"-4.17383,-7.22656 -1.292,-0.744 -2.72992,-1.12304 -4.16992,-1.12304 z"

loop_bound_left = "M 0,20 V 0 L 12,9.302 V 0 h 3 v 10 10 h -3 v -9.301 z"
loop_bound_right = "M 15,0 15,20 3,10.698 3,20 0,20 0,10 V 0 l 3,0 v 9.301 z"
eject_btn_str = "M 149.48242 82.082031 C 145.87942 82.082031 142.44423 83.471063 " +
"139.99023 85.914062 L 79.53125 146.13867 C 79.38025 146.28667 " +
"79.238703 146.43684 79.095703 146.58984 C 78.156703 147.62484 " +
"77.433734 148.76403 76.927734 149.95703 C 76.426734 151.14503 " +
"76.120781 152.41505 76.050781 153.74805 C 76.039781 153.95105 " +
"76.035156 154.14956 76.035156 154.35156 L 76.035156 154.50391 " +
"C 76.059156 156.15091 76.437375 157.72444 77.109375 159.14844 " +
"C 77.781375 160.58244 78.763734 161.91178 80.052734 163.05078 " +
"L 80.0625 163.06055 C 80.2465 163.22355 80.436906 163.37825 " +
"80.628906 163.53125 C 80.633906 163.53125 80.633672 163.53711 " +
"80.638672 163.53711 C 81.774672 164.42911 83.034422 165.10612 " +
"84.357422 165.57812 C 85.605422 166.02412 86.947703 166.29328 " +
"88.345703 166.36328 L 88.359375 166.36328 C 88.583375 166.36828 " +
"88.728062 166.36805 89.039062 166.37305 L 209.92188 166.37305 " +
"L 209.95703 166.37305 L 210.00586 166.37305 C 217.16686 166.37305 " +
"222.97461 160.99247 222.97461 154.35547 C 222.97461 150.85647 " +
"221.36683 147.71072 218.79883 145.51172 L 158.97656 85.914062 " +
"C 156.52256 83.469063 153.08542 82.082031 149.48242 82.082031 " +
"z M 90.736328 184.95898 C 82.618328 184.95898 76.037109 " +
"191.53916 76.037109 199.66016 C 76.037109 207.77616 82.618328 " +
"214.35547 90.736328 214.35547 L 208.27539 214.35547 C 216.39339 " +
"214.35547 222.97466 207.77316 222.97266 199.66016 C 222.97266 " +
"191.53916 216.39144 184.95898 208.27344 184.95898 L 90.736328 " +
"184.95898 z"
