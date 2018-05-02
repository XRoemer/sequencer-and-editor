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

function create_svg_btn(x,y,id,type,fkt) {
  var w = SVGs.r_bound
  var h = SVGs.r_bound
  var stroke_w = SVGs.stroke_w
  var path = document.createElementNS("http://www.w3.org/2000/svg", 'path')
  path.setAttributeNS(null, "d", SVGs.btn_str);
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttributeNS(null, "stroke-width", stroke_w);
  svg.setAttributeNS(null, "z-index", 30);
  svg.style.fill = 'rgb(221,220,220)'
  svg.style.stroke = 'black'
  svg.style.position="absolute"
  svg.style.width = w
  svg.style.height = h
  svg.style.left = x
  svg.style.top = y
  svg.id = id
  //svg.setAttribute("class", classes)
  if (type == 'button'){svg.onclick = fkt}
  else if (type == 'toggle') {
    svg.onclick = svg_toggle
    svg.fkt = fkt
  }
  svg.appendChild(path);
  svg.state = false
  return svg
}

function create_svg_radio(x,y,id,type,fkt,amount) {
  var w = SVGs.r_bound
  var h = SVGs.r_bound
  var stroke_w = SVGs.stroke_w
  var container = document.createElement("div");
  container.style.position = 'absolute'
  container.style.left = x.toString() + 'px'
  container.style.top = y.toString() + 'px'

  var pos = 0
  for(var i=0; i< amount; i++) {
    var btn = create_svg_btn(pos,0,i,'toggle',fkt)
    btn.type = 'radio'
    btn.fkt = fkt
    btn.container = container
    container.appendChild(btn)
    pos += w
  }
  return container
}

function svg_toggle(e) {
  var par = e.srcElement.parentElement
  par.state = !par.state

  if (par.state) {par.style.fill = 'orange'}
  else {par.style.fill = 'rgb(200,200,200)'}
  if (par.type != 'radio') {par.fkt(e)}
  else {
    toggle_radios(e)
    par.fkt(parseInt(par.id))
  }
}

function svg_radio(e) {
  var par = e.srcElement.parentElement
  par.state = !par.state
  if (par.state) {par.style.fill = 'orange'}
  else {par.style.fill = 'rgb(200,200,200)'}
  par.fkt(e)
}

function toggle_radios(e) {
  var par = e.srcElement.parentElement
  var childs = par.container.children
  var amount = childs.length

  for(var i=0; i< amount; i++) {
    if (i != parseInt(par.id)){
      par2 = childs[i]
      par2.state = false
      par2.style.fill = 'rgb(200,200,200)'
    }
  }
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
