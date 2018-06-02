

function open_settings(e) {
  var x = e.screenX - 190
  var y = e.screenY + 60
  open_win(x,y,390,220,'settings_win',"init/settings.html", on_load_settings)
}


function on_load_settings(e){

  var doc = e.srcElement
  cnv = doc.getElementById('cnv_settings')
  ctx = cnv.getContext('2d')
  ctx.fillStyle = 'rgba(245, 245, 215, 1)'
  ctx.fillRect(0,0, cnv.width, cnv.height)

  ctrl_cont = doc.getElementById('settings')

  ctrl_cont.appendChild(sf.create_nr(10, 10, 50, 600, 2000, 100,
    set_win_size_x, V.window_w, set_number_by_wheel, 'window_w'))
  ctrl_cont.appendChild(sf.create_label(68, 10, 'win size x', 11))

  ctrl_cont.appendChild(sf.create_nr(10, 30, 50, 200, 1000, 100,
    set_win_size_y, V.window_h, set_number_by_wheel, 'window_h'))
  ctrl_cont.appendChild(sf.create_label(68, 30, 'win size y', 11))

  ctrl_cont.appendChild(sf.create_nr(10, 60, 50, 100, 10000, 100,
    set_cnv_size_x, V.win_w, set_number_by_wheel, 'win_w'))
  ctrl_cont.appendChild(sf.create_label(68, 60, 'canvas size x', 11))

  ctrl_cont.appendChild(sf.create_nr(10, 80, 50, 100, 2000, 100,
    set_cnv_size_y, V.win_h, set_number_by_wheel, 'win_h'))
  ctrl_cont.appendChild(sf.create_label(68, 80, 'canvas size y', 11))

  ctrl_cont.appendChild(sf.create_nr(160, 10, 50, 1, 100, 1,
    set_amount_of_rows, V.amount_rows, set_number_by_wheel, 'amount_rows'))
  ctrl_cont.appendChild(sf.create_label(218, 10, 'amount rows', 11))
  
  ctrl_cont.appendChild(sf.create_nr(160, 30, 50, 1, 30, 1,
      set_update_freq, V.update_freq, set_number_by_wheel, 'update_freq'))
  ctrl_cont.appendChild(sf.create_label(218, 30, 'update frequency', 11))
  
  ctrl_cont.appendChild(sf.create_svg_btn(160, 60, 'use_tr', 'toggle', set_log_rec, V.log_receive))
  ctrl_cont.appendChild(sf.create_label(180, 62, 'log received data', 10, 'log_rec'))
  
  ctrl_cont.appendChild(sf.create_svg_btn(160, 80, 'use_send', 'toggle',  set_log_send, V.log_send))
  ctrl_cont.appendChild(sf.create_label(180, 82, 'log send data', 10, 'log_send'))
  
  ctrl_cont.appendChild(sf.create_label(10, 110, 'item colors', 11, 'i_col'))
  
  var str_path = SVGs.rectangle(0,0, 40, 3, 20)
  
  var btn = sf.create_color_picker(10, 130, 40 ,20, 'items_col0', V.elem_cols[0], set_elem_cols)
  ctrl_cont.appendChild(btn)
  
  btn = sf.create_color_picker(50, 130, 40 ,20, 'items_col1', V.elem_cols[1], set_elem_cols)
  ctrl_cont.appendChild(btn)
    
  btn = sf.create_color_picker(90, 130, 40 ,20, 'items_col2', V.elem_cols[2], set_elem_cols)
  ctrl_cont.appendChild(btn)

  draw_item_palette(ctrl_cont,155)

}

function draw_item_palette(ctrl_cont, y){
  var ctx = ctrl_cont.children['cnv_settings'].getContext("2d")
  var path = new Path2D()
  
  for (var i = 0; i < 128; i++){
    path.rect(i * 1 + 5,y,2,20)
    ctx.fillStyle = calc_color(i)
    ctx.fillRect(i * 2.5 + 10 ,y,2.5,20)
  }  
}

function set_elem_cols(e){
  var c = hexToRgb(e.target.value)
  var new_col = [c.r, c.g, c.b]
  if (e.target.id == 'items_col0') {V.elem_cols[0] = new_col}
  else if (e.target.id == 'items_col1') {V.elem_cols[1] =new_col}
  else if (e.target.id == 'items_col2'){ V.elem_cols[2] = new_col}
  draw_item_palette(ctrl_cont, 155)
}

function set_number_by_wheel(e,_min,_max){
  var dx = e.deltaY / 100
  var val = e.srcElement.value * 1 - dx
  var val = Math.max(val,_min)
  var val = Math.min(val,_max)
  e.srcElement.value = val
  V[e.srcElement.var_name] = val
}

function set_win_size_x(e){
  V.window_w = e.srcElement.valueAsNumber
  window.resizeTo(V.window_w , V.window_h )
  data.send_data('settings window_w ' + V.window_w, window.win_nr)
}
function set_win_size_y(e){
  V.window_h = e.srcElement.valueAsNumber
  window.resizeTo(V.window_w , V.window_h )
  data.send_data('settings window_h ' + V.window_h, window.win_nr)
}
function set_cnv_size_x(e){
  V.win_w = e.srcElement.valueAsNumber
  data.send_data('settings win_w ' + V.win_w, window.win_nr)
  adjust_all()
}
function set_cnv_size_y(e){
  V.win_h = e.srcElement.valueAsNumber
  data.send_data('settings win_h ' + V.win_h, window.win_nr)
  adjust_all()
}
function set_amount_of_rows(e){
  V.amount_rows = e.srcElement.valueAsNumber
  data.send_data('settings amount_rows ' + V.amount_rows, window.win_nr)
  sm.init()
  adjust_all()
}
function set_update_freq(e){
  try {
    data.send_data('settings update_freq ' + V.update_freq, window.win_nr)
  }
  catch(e){log(e)}
}
function set_log_rec(e){
  V.log_receive = e.srcElement.parentElement.state
}
function set_log_send(e){
  V.log_send = e.srcElement.parentElement.state
}

