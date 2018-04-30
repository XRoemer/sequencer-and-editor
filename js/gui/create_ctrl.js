
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

  ctrl_cont.appendChild(create_radios(80, 20, 8, resp_quant));
  ctrl_cont.appendChild(create_label(80, 0, 'Q', 16));
  ctrl_cont.appendChild(create_label(100, 4, '1/8 norm', 10, 'quant'));

  ctrl_cont.appendChild(create_checkbox(190, 17, 'use_tr', resp_use_triplets));
  ctrl_cont.appendChild(create_label(182, 4, 'triplets', 10, 'tripl'));

  ctrl_cont.appendChild(create_checkbox(220, 17, 'use_q', resp_use_quant));
  ctrl_cont.appendChild(create_label(222, 4, 'use', 10, 'use_q'));

  ctrl_cont.appendChild(create_label(265, 4, 'ITEM', 12));
  ctrl_cont.appendChild(create_label(300, 4, 'row 18 start 4.4.87 len 0.0.12 vol 96', 10, 'item'));

  ctrl_cont.appendChild(create_label(265, 24, 'MOUSE', 12));
  ctrl_cont.appendChild(create_label(315, 24, 'row 18 pos 4.4.87', 10, 'mouse'));

  ctrl_cont.appendChild(create_btn(500, 2, 12, 'gui', call_settings));
  ctrl_cont.appendChild(create_label(518, 2, 'settings', 10))
  ctrl_cont.appendChild(create_btn(500, 17, 12, 'clear', clear_from_gui));
  ctrl_cont.appendChild(create_label(518, 17, 'clear', 10))
  ctrl_cont.appendChild(create_btn(500, 32, 12, 'init', create_seqgui));
  ctrl_cont.appendChild(create_label(518, 32, 'init', 10))

  ctrl_cont.appendChild(create_btn(560, 2, 12, 'midi', call_midi));
  ctrl_cont.appendChild(create_label(578, 2, 'midi', 10))

  ctrl_cont.appendChild(create_btn(560, 17, 12, 'tgl_player', toggle_player));
  ctrl_cont.appendChild(create_label(578, 17, 'player', 10))

  ctrl_cont.appendChild(create_btn(560, 32, 12, 'test', call_test));
  ctrl_cont.appendChild(create_label(578, 32, 'test', 10))

  resize_window(window, window_w , window_h)
}



function clear_from_gui(){
  clear_sequencer()
  send_data('memory clear', window.win_nr)
}
