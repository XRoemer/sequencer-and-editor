

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

  ctrl_cont.appendChild(create_nr(10, 10, 50, 600, 2000, 100,
    set_win_size_x, window_w, set_number_by_wheel, 'window_w'));
  ctrl_cont.appendChild(create_label(68, 10, 'win size x', 11));

  ctrl_cont.appendChild(create_nr(10, 30, 50, 200, 1000, 100,
    set_win_size_y, window_h, set_number_by_wheel, 'window_h'));
  ctrl_cont.appendChild(create_label(68, 30, 'win size y', 11));

  ctrl_cont.appendChild(create_nr(10, 60, 50, 100, 10000, 100,
    set_cnv_size_x, win_w, set_number_by_wheel, 'win_w'));
  ctrl_cont.appendChild(create_label(68, 60, 'canvas size x', 11));

  ctrl_cont.appendChild(create_nr(10, 80, 50, 100, 2000, 100,
    set_cnv_size_y, win_h, set_number_by_wheel, 'win_h'));
  ctrl_cont.appendChild(create_label(68, 80, 'canvas size y', 11));

  //
  ctrl_cont.appendChild(create_nr(160, 10, 50, 1, 100, 1,
    set_amount_of_rows, amount_rows, set_number_by_wheel, 'amount_rows'));
  ctrl_cont.appendChild(create_label(218, 10, 'amount rows', 11));

  ctrl_cont.appendChild(create_checkbox(160, 50, 'use_tr', set_log_rec, log_receive));
  ctrl_cont.appendChild(create_label(180, 52, 'log received data', 10, 'log_rec'));

  ctrl_cont.appendChild(create_checkbox(160, 70, 'use_tr', set_log_send, log_send));
  ctrl_cont.appendChild(create_label(180, 72, 'log send data', 10, 'log_send'));

}

function set_number_by_wheel(e){

  var dx = e.deltaY / 100
  e.srcElement.value = Number(e.srcElement.value) - dx
  window[e.srcElement.var_name] = Number(e.srcElement.value) - dx

}

function set_win_size_x(e){
  window_w = e.srcElement.valueAsNumber
  window.resizeTo(window_w , window_h )
  send_data('settings window_size_w ' + window_w, window.win_nr)
}
function set_win_size_y(e){
  window_h = e.srcElement.valueAsNumber
  window.resizeTo(window_w , window_h )
  send_data('settings window_size_h ' + window_h, window.win_nr)
}
function set_cnv_size_x(e){
  win_w = e.srcElement.valueAsNumber
  create_seqgui()
  set_items(val_array)
  send_data('settings win_size_w ' + win_w, window.win_nr)

}
function set_cnv_size_y(e){
  win_h = e.srcElement.valueAsNumber
  create_seqgui()
  set_items(val_array)
  send_data('settings win_size_h ' + win_h, window.win_nr)

}
function set_amount_of_rows(e){
  amount_rows = e.srcElement.valueAsNumber
  create_seqgui()
  set_items(val_array)
  send_data('settings amount_rows ' + amount_rows, window.win_nr)
}

function set_log_rec(){
  log_receive = this.checked
  log(log_receive)

}
function set_log_send(){
  log_send = this.checked
}
