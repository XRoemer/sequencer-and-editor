// Listen to keyboard.
window.onkeydown = get_key;
window.onmousemove = window_mousemove;
window.onmouseup = window_mouseup;
window.onwheel = scroll_window_by_wheel;
window.onscroll = correct_positions

var win = nw_gui.Window.get()

win.on('close', function() {
  win.removeAllListeners('close');
  log('close', open_windows,window.win_nr)
  delete open_windows[window.win_nr]
  win.close()
});

function correct_positions(e) {
  // correct elements which need to keep their position
  var scrollY = window.scrollY
  var scrollX = window.scrollX
  div_scale_x.style.left = -scrollX + V.scaleY_w
  div_scale_y.style.top = -scrollY
  bottom_left_div.style.left = scrollX - V.scaleY_w

  pointer.pointer_triad.style.left = pointer.pointer_x - scrollX - 7.5
  pointer.pointer.style.left = pointer.pointer_x - scrollX
  pointer.loop_border_left.style.left = pointer.loop_start_x - scrollX - 14
  pointer.loop_border_right.style.left = pointer.loop_end_x - scrollX

  // hide/show transport and loop_bounds
  if (pointer.loop_start_x - scrollX < 0) {
    pointer.loop_border_left.style.visibility  = 'hidden'
  } else {pointer.loop_border_left.style.visibility  = 'visible'}

  if (pointer.loop_end_x - scrollX < 0) {
    pointer.loop_border_right.style.visibility  = 'hidden'
  } else {pointer.loop_border_right.style.visibility  = 'visible'}

  if (pointer.pointer_x - scrollX < 0) {
    pointer.pointer.style.visibility  = 'hidden'
      pointer.pointer_triad.style.visibility  = 'hidden'
    } else {
      pointer.pointer.style.visibility  = 'visible'
      pointer.pointer_triad.style.visibility  = 'visible'
    }
}

function scroll_window_by_wheel(e) {
  if (e.shiftKey) return
  
  if (e.ctrlKey){
    V.win_h += e.deltaY / 50
    data.send_data('settings win_h ' + V.win_h, window.win_nr)
    adjust_all()
  } else {
    var scrollX_old = window.scrollX
    var rel = V.win_w / scrollX_old
    V.win_w += e.deltaY
    V.win_w = Math.max(600,V.win_w)
    var scrollX_new = V.win_w / rel
    gui.scale_seqgui()
    sc += 1
    window.scrollTo({left:scrollX_new})
    data.send_data('settings win_w ' + V.win_w, window.win_nr)
  }
}

function adjust_all(){
  gui.set_widths_and_heights()
  gui.clear_gui()
  gui.create_seqgui()
  pointer.adjust_transport_stroke()
  items.adjust_items()
}

function get_key(e){
  if (e.ctrlKey && e.key =='l') {V.log_receive = !V.log_receive; log('log '+ V.log_receive)}
  if (e.ctrlKey && e.key =='r') {V.log_send = !V.log_send; log('log send ' + V.log_send)}
  if (e.code == 'Space') {
    if (player.status == 'play') {player.btn_triggered('stop')}
    else {player.btn_triggered('play')}
  }
  if (e.ctrlKey && e.key =='m') main.toggle_main()
  if (e.ctrlKey && e.key =='s') sm.reset_all()
  if (e.altKey  && e.key =='x' ) items.select_items_on_row()
  if (e.ctrlKey && (e.key =='x' || e.key =='y')) {
    items.move_items_direction = e.key
    items.mouse_row = main.mouse_pos.row - 1}
  if (e.ctrlKey && (e.key =='ArrowUp' || e.key =='ArrowDown')) params.change_par_selection(null,e.key)
  if (e.ctrlKey && e.key =='d') items.repeat_selected()
  if (e.altKey && e.key =='s') items.snapshot()
  if (e.ctrlKey && [0,1,2,3,4,5,6,7,8,9].includes(e.key*1)) items.call_snapshot(e.key)
  if (e.key == 'Backspace' || e.key =='Delete') items.delete_selected()
  if (e.key =='Enter') items.deselect_items()
  if (e.key =='Escape') items.abort_move_items()
}

function window_mousemove(e) {
  if (V.loop_bound_left_clicked || V.loop_bound_right_clicked) {
    pointer.move_bounds(e.clientX - V.scaleY_w)
  }
}

function window_mouseup(e) {
  if (V.loop_bound_left_clicked || V.loop_bound_right_clicked) {
    V.loop_bound_left_clicked = false
    V.loop_bound_right_clicked = false
  }
  window.dragging = false
}
sc = 0


function load_tcp(args){
  tcp = new Tcp()
}

var val_array = []

class Data {

  constructor(){

  }

  dist_data(data, from){
    var datas = data.toString().split(';')
    if(V.log_receive){log(from, datas)}

    var tmp, name, values, win_nr

    for (var i = 0; i < datas.length; i++) {
      tmp = datas[i].split(' ')
      win_nr = tmp[0].trim()
      name = tmp[1].trim()

      values = tmp.slice(2,tmp.length)

      if (open_windows[win_nr]){
        open_windows[win_nr].data.distribute_data(name, values)
      }
      else {
        //log("sequencer doesn't exist",name,values,win_nr)
        }
    }
  }

  distribute_data(name, values){

    // testing for selections
    if      (name === 'clear')      {gui.clear_sequencer()}
    else if (name === 'load_start') {gui.clear_all()}
    else if (name === 'pos_pointer'){pointer.move_pointer(values)}
    else if (name === 'init')       {gui.create_seqgui()}
    else if (name === 'set_var')    {V.set_var(values)}
    else if (name === 'set_par')    {params.insert_par(values)}
    else if (name === 'set_muted')  {sm.set_muted(values)}
    else if (name === 'set_item')   {val_array.push(values)}
    else if (name === 'load_stop')  {

      items.set_items(val_array)
      }
  }

  send_data(data, nr){
    var d = ' # ' + nr + ' ' + data + ' * '
    if(V.log_send){log(d)}
    tcp.client.write(d);
  }

  // out: move item x: change #id pos #bar #micro #cent
  // out: change item len: change #id len #bar #micro #cent
  // out: move item y: change #id row #row
  // out: new item: new #id #bar #micro #cent #barlen #microlen #centlen #vol
  // out: amount_bars: amount_bars #amount_bars
  // out: clear: clear
  // in: pos_pointer: pos_pointer pos #pos

  send_item_x(id,midipos){
    this.send_data(['memory change',id,'pos',midipos.bar,midipos.micro,midipos.cent].join(' '), window.win_nr)
  }
  send_item_w(id,midilen){
    var bar = midilen.bar - 1
    var micro = midilen.micro - 1
    this.send_data(['memory change',id,'len',bar,micro,midilen.cent].join(' '), window.win_nr)
  }
  send_item_row(id,row){
    this.send_data('memory change '+id+' row '+row, window.win_nr)
  }
  send_new_item(id,row,bar,micro,cent,len_bar,len_micro,len_cent,vol){
    var str = ['memory new',id,row,bar-1,micro-1,cent,len_bar,len_micro,len_cent,vol].join(' ')
    this.send_data(str, window.win_nr)
  }
  send_del_item(id){
    this.send_data('memory del '+id, window.win_nr)
  }
  send_item_vol(id){
    this.send_data('memory change '+id+' vol ' + V.vol, window.win_nr)
  }
  send_item_param(id, par, val){
    this.send_data('memory change ' + id + ' par ' + par + ' ' + val, window.win_nr)
  }
  send_param_settings(par, val){
    var str = val.start + ' ' + val.scope + ' ' + val.step
    this.send_data('settings parameters set ' + par + ' ' + str, window.win_nr)
  }
  send_muted(val){
    val = val.join(' ')
    this.send_data('settings muted ' + val, window.win_nr)
  }
}

var data = new Data()
