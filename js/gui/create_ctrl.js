
function create_ctrl() {

  cnv = document.getElementById('canvas_ctrl')
  ctx = cnv.getContext('2d')
  ctx.fillStyle = 'rgba(245, 245, 215, 1)'
  ctx.fillRect(0,0, cnv.width, cnv.height)

  ctrl_cont = document.getElementById('ctrl')

  ctrl_cont.appendChild(create_nr(10, 2, 36, 0, 100, 1, set_bars, amount_bars));
  ctrl_cont.appendChild(create_label(48, 2, 'bars', 12));

  ctrl_cont.appendChild(create_nr(10, 21, 36, 1, 15, 1, set_micro, micro));
  ctrl_cont.appendChild(create_label(48, 21, '/4', 12));

  ctrl_cont.appendChild(create_svg_radio(80, 20, 'quant_radios', 'radio', set_quant, 8, 3))
  ctrl_cont.appendChild(create_label(80, 0, 'Q', 16));
  ctrl_cont.appendChild(create_label(100, 4, '1/8 norm', 10, 'quant'));

  ctrl_cont.appendChild(create_svg_btn(190, 20, 'use_tr', 'toggle', set_use_triplets));
  ctrl_cont.appendChild(create_label(182, 4, 'triplets', 10, 'tripl'));

  ctrl_cont.appendChild(create_svg_btn(220, 20, 'use_q', 'toggle', set_use_quant));
  ctrl_cont.appendChild(create_label(222, 4, 'use', 10, 'use_q'));

  ctrl_cont.appendChild(create_label(265, 4, 'ITEM', 12));
  ctrl_cont.appendChild(create_label(300, 4, 'row 18 start 4.4.87 len 0.0.12 vol 96', 10, 'item'));

  ctrl_cont.appendChild(create_label(265, 24, 'MOUSE', 12));
  ctrl_cont.appendChild(create_label(315, 24, 'row 18 pos 4.4.87', 10, 'mouse'));

  ctrl_cont.appendChild(create_svg_btn(500, 2, 'gui', 'button', call_settings));
  ctrl_cont.appendChild(create_label(518, 2, 'settings', 10))
  ctrl_cont.appendChild(create_svg_btn(500, 17, 'clear', 'button', clear_from_gui));
  ctrl_cont.appendChild(create_label(518, 17, 'clear', 10))

  ctrl_cont.appendChild(create_svg_btn(560, 2, 'midi', 'button', call_midi));
  ctrl_cont.appendChild(create_label(578, 2, 'midi', 10))

  ctrl_cont.appendChild(create_svg_btn(560, 17, 'tgl_player', 'button', toggle_player));
  ctrl_cont.appendChild(create_label(578, 17, 'player', 10))

  ctrl_cont.appendChild(create_svg_btn(560, 32, 'test', 'button', call_test));
  ctrl_cont.appendChild(create_label(578, 32, 'test', 10))
}



function clear_from_gui(){
  clear_sequencer()
  send_data('memory clear', window.win_nr)
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
function show_mouse_pos(bar, micro, cent, row) {
  var lbl = document.getElementById('mouse')
  var p = '.'
  var start = bar + p + micro + p + cent
  row += 1
  lbl.innerHTML = "row " + row + " pos " + start
}

function show_item_pos(it) {
  lbl = document.getElementById('item')
  var p = '.'
  var sp = ' '
  
  if (it.cent < 10) {var c = '0' + it.cent.toString()}
  else {var c = it.cent.toString()}
  if (it.len_cent < 10) {var lc = '0' + it.len_cent.toString()}
  else {var lc = it.len_cent.toString()}
  var start = 'start ' + it.bar + p + it.micro + p + c + sp
  var len = 'len ' + it.len_bar + p + it.len_micro + p + lc + sp
  var vol = 'vol ' + it.vol
  var row = 'row ' + (it.row + 1) + sp
  
  lbl.innerHTML = row + start + len + vol
}

	