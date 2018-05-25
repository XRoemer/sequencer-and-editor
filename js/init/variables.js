class Variables {
  constructor(){
    this.quant = 4 // -> 1 2 4 8 16 32 64 128
    this.quant_cents = [] // set in gui.set_widths_and_heights in init.js
    this.use_quant = false
    this.use_triplets = false
    
    this.amount_bars = 4
    this.micro = 4
    this.amount_rows = 13
    this.line_design = 0 // 0,1,2,3: piano, iter, group of 4, group of 5
    this.vol = 80 // global var to set vol for new items to last item
    
    
    // sequencer canvas size
    this.win_w = 650
    this.win_h = 200
    // browser size
    this.window_w = 690
    this.window_h = 415
    // element sizes
    this.ctrl_h = 50
    this.player_h = 30
    this.scaleX_h = 20
    this.scaleY_w = 24
    this.solo_w = 24
    this.numbers_w = 20
    this.params_h = 64
    this.params_el_w = 8
    this.params_min_height = 50
    this.params_max_height = 512
    
    this.pointer_w = 3
    this.pointer_col = [0,100,0,1]
    this.update_freq = 10
    
    this.elem_h = 10 // set on init
    this.elem_w = 10 // set on init
    this.item_w = 10 // set on init
    this.barlen = 10
    this.miclen = 10
    
    
    this.elem_cols = [ [205,213,229], [255,255,197], [107,31,69] ]
    this.elem_cols = [[214, 214, 214],[252, 236, 120],[103, 14, 16]]
    this.elem_cols = [[226, 226, 226],[206, 253, 204],[21, 2, 108]]
    
    this.line_layouts = [
      [0,-1,2,-1,4,5,-1,7,-1,9,-1,11],
      [0,-1],
      [0,1,2,3,],
      [0,1,2,3,4]
    ]
    this.col_btn_inactive = 'rgb(221,220,220)'
    this.col_btn_active = 'orange'
    this.xAxis_bg_col = 'rgba(220, 215, 215, 1)'
    this.yAxis_bg_col = 'rgba(200, 195, 195, 1)'
    this.main_bg_col = 'rgba(245, 245, 215, 1)'
    this.player_bg_col = 'rgba(160,140, 140, 1)'
    
    
    this.show_parameters = true
    this.show_player = true
    this.show_main = true
    this.show_solo = false
    
    this.loop_bound_left_clicked = false
    this.loop_bound_right_clicked = false
        
    this.log_receive = false
    this.log_send = false
  }
  
  set_var(val) {
    if (val.length > 1) {
      name = val[0].trim()
      if (name === 'col0') this.elem_cols[0] = [val[1]*1, val[2]*1, val[3]*1]
      else if (name === 'col1') this.elem_cols[1] = [val[1]*1, val[2]*1, val[3]*1]
      else if (name === 'col2') this.elem_cols[2] = [val[1]*1, val[2]*1, val[3]*1]
      else if(name == 'loop_start' || name == 'loop_end' ){this.set_pointer_bounds(val, name)}
      else if(name == 'use_bounds') player.use_bounds = val[1]*1
      else if(name == 'loop_on') player.loop_on = val[1]*1
      else if(name == 'show_solo') {this.show_solo = val[1]*1 ; main.set_col('show_solo',this.show_solo)}
      else if(name == 'show_parameters') {this.show_parameters = val[1]*1 ; main.set_col('show_parameters',this.show_parameters)}
      else if(name == 'show_player') {this.show_player = val[1]*1 ; main.set_col('show_player',this.show_player)}
      else if(name == 'show_main') {this.show_main = val[1]*1}
      else {
        this[val[0]] = Number(val[1])
      }
    }
  }

  set_pointer_bounds(val, name){
    setTimeout(function() { 
      var [bar, micro, cent] = val[1].split('.')
      var midi_pos = {bar, micro, cent}
      var x = pointer.get_x_pos(midi_pos)
      if (name == 'loop_start') pointer.move_bounds(x.x, 'left', true)
      else pointer.move_bounds(x.x, 'right', true)
      }, 50);
  }

  set_quant() {
    var lbl = document.getElementById('quant')
    V.quant = Math.pow(2,Number(this.id))
    var tri = V.use_triplets ? ' triplets' : ' norm'
    lbl.innerHTML = "1/" + V.quant.toString() + tri
    gui.set_widths_and_heights()
    gui.set_quantisation()
  }
  set_bars(e) {
    V.amount_bars = e.srcElement.valueAsNumber
    var val = 'settings amount_bars ' + V.amount_bars
    data.send_data(val, window.win_nr)
    gui.set_widths_and_heights()
    //gui.clear_gui()
    gui.create_seqgui()
    gui.scale_items()
  }
  set_micro(e) {
    V.micro = e.srcElement.valueAsNumber
    var val = 'settings micro ' + V.micro
    data.send_data(val, window.win_nr)
    gui.set_widths_and_heights()
    //gui.clear_gui()
    gui.create_seqgui()
    gui.scale_items()
  }
  set_use_triplets(e) {
    V.use_triplets = e.srcElement.parentElement.state
    gui.set_widths_and_heights()
    gui.set_quantisation()
    var lbl = document.getElementById('quant')
    var tri = V.use_triplets ? ' triplets' : ' norm'
    lbl.innerHTML = "1/" + V.quant.toString() + tri
  }

  set_use_quant(e) {
    V.use_quant = e.srcElement.parentElement.state
  }
}

var V = new Variables()

//holding all opened nw windows
var open_windows = {}
var initialized = false


