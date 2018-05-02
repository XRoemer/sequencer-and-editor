// Listen to keyboard.
window.onkeydown = get_key;
window.onkeyup = end_key;
window.onmousemove = window_mousemove;
window.onmouseup = window_mouseup;
window.onwheel = window_scroll;

var win = gui.Window.get()

win.on('close', function() {
  win.removeAllListeners('close');
  log('close', open_windows,window.win_nr)
  delete open_windows[window.win_nr]
  win.close()
});
gui.App.on('open', function (argString) {
  argString = argString.split(' ')
  var nr = argString[argString.length - 1]
  if (!open_windows[nr]) {
    open_new_sequencer_window(nr)
  }
  else {
    chrome.windows.update(open_windows[nr].id, {focused : true});
  }
});

function get_key(e){
  if (e.key == 'Control') { ctrl_pressed = true }
  if (e.key == 'Shift') { shift_pressed = true }
  if (e.key == 'Alt') { alt_pressed = true }

  if (ctrl_pressed && e.key =='l') {log_receive = !log_receive; log('log '+ log_receive)}
  if (ctrl_pressed && e.key =='r') {log_send = !log_send; log('log send ' + log_send)}
  if (e.code == 'Space') {
    if (player.status == 'play') {player.btn_triggered('stop')}
    else {player.btn_triggered('play')}
  }
}

function end_key(e){
  if (e.key == 'Control') { ctrl_pressed = false }
  if (e.key == 'Shift') { shift_pressed = false }
  if (e.key == 'Alt') { alt_pressed = false }
}

function window_mousemove(e) {
  if (loop_bound_left_clicked || loop_bound_right_clicked) {
    pointer.move_bounds(e.clientX - 40)
  }
}
function window_mouseup(e) {
  if (loop_bound_left_clicked || loop_bound_right_clicked) {
    loop_bound_left_clicked = false
    loop_bound_right_clicked = false
  }
}

function window_scroll(e) {
  if(ctrl_pressed) {
    var scrollX_old = window.scrollX
    var rel = win_w / scrollX_old
    win_w += e.deltaY
    win_w = Math.max(600,win_w)
    var scrollX_new = win_w / rel
    scale_seqgui()
    window.scrollTo(scrollX_new, window.srollY)
    send_data('settings win_size_w ' + win_w, window.win_nr)
  }
}

window.addEventListener('scroll', function(e) {
  // correct elements which need to keep their position
  var scrollY = window.scrollY
  var scrollX = window.scrollX
  var scale_x = window.document.getElementById('div_scale_x')
  scale_x.style.top = 50 + scrollY
  var scale_y = window.document.getElementById('div_scale_y')
  scale_y.style.left = scrollX
  var c = window.document.getElementById('scale_y_bg')
  c.style.left = scrollX
  var c = window.document.getElementById('top_left_div')
  c.style.left = scrollX
  c.style.top = 50 + scrollY

  pointer.pointer_triad.style.top = scrollY - 20
  pointer.loop_border_left.style.top = scrollY - 20
  pointer.loop_border_right.style.top = scrollY - 20
  //log(scrollX,pointer.loop_border_left.style.left)
  if (scrollX - parseInt(pointer.loop_border_left.style.left) > 15) {
    pointer.loop_border_left.style.visibility  = 'hidden'
  } else {pointer.loop_border_left.style.visibility  = 'visible'}
  if (scrollX - parseInt(pointer.loop_border_right.style.left) > 0) {
    pointer.loop_border_right.style.visibility  = 'hidden'
  } else {pointer.loop_border_right.style.visibility  = 'visible'}


});

function load_tcp(args){
  tcp = new Tcp()
}

var val_array = []

function dist_data(data, from){
  var datas = data.toString().split(';')
  if(log_receive){log(from, datas)}

  var tmp, name, values, win_nr

  for (i = 0; i < datas.length; i++) {
    tmp = datas[i].split(' ')
    win_nr = tmp[0].trim()
    name = tmp[1].trim()
    values = tmp.slice(2,tmp.length)

    if (open_windows[win_nr]){
      open_windows[win_nr].distribute_data(name, values)
    }
    else {log("sequencer doesn't exist")}
  }
}

function distribute_data(name, values){
  // testing for selections
  if      (name === 'load')       {clear_sequencer(); val_array = []}
  else if (name === 'pos_pointer'){pointer.move_pointer(values)}
  else if (name === 'init')       {create_seqgui()}
  else if (name === 'set_var')    {set_var(values)}
  else if (name === 'set_item')   {val_array.push(values)}
  else if (name === 'load_stop')  {set_items(val_array)}
}

function send_data(data, nr){
  var d = ' # ' + nr + ' ' + data + ' * '
  if(log_send){log(d)}
  tcp.client.write(d);
}

// out: move item x: change #id pos #bar #micro #cent
// out: change item len: change #id len #bar #micro #cent
// out: move item y: change #id row #row
// out: new item: new #id #bar #micro #cent #barlen #microlen #centlen #vol
// out: amount_bars: amount_bars #amount_bars
// out: clear: clear
// in: pos_pointer: pos_pointer pos #pos
