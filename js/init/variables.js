
var quant = 8 // -> 1 2 4 8 16 32 64 128
var quant_cents = [] // set in set_widths_and_heights in init.js
var use_quant = false
var use_triplets = false

var amount_bars = 4
var micro = 4

// sequencer canvas size
var win_w = 1600
var win_h = 500
// browser size
var window_w = 800
var window_h = 300


var ctrl_h = 50
var scaleX_h = 20
var scaleY_w = 40
var player_h = 30

var pointer_w = 3
var pointer_col = [0,100,0,1]

var elem_h = 10 // set on init
var elem_w = 10 // set on init
var item_w = 10 // set on init

var vol = 80 // global var to set vol for new items.dict to last item

var amount_rows = 20
var line_design = 0 // 0,1,2,3: piano, iter, group of 4, group of 5

var elem_cols = [ [205,213,229], [255,255,197], [107,31,69] ]
var line_layouts = [
  [0,-1,2,-1,4,5,-1,7,-1,9,-1,11],
  [0,-1],
  [0,1,2,3,],
  [0,1,2,3,4]
]
col_btn_inactive = 'rgb(221,220,220)'
col_btn_active = 'orange'

var open_windows = {}

initialized = false
ctrl_pressed = false
shift_pressed = false
alt_pressed = false

loop_bound_left_clicked = false
loop_bound_right_clicked = false

seq_dragging = false
seq_dragstart = [0,0]

var log_receive = false
var log_send = false


function set_var(val) {
  if (val.length > 1) {
    name = val[0].trim()
    if (name === 'elem_cols') {
      elem_cols[Number(val[1])] = [Number(val[2]), Number(val[3]), Number(val[4])]
    }
    else if (name === 'win_size') {
      win_w = Number(val[1])
      win_h = Number(val[2])
    }
    else {
      window[val[0]] = Number(val[1])
    }
  }
}

function set_quant() {
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
function set_use_triplets(e) {
  use_triplets = e.srcElement.parentElement.state
  set_widths_and_heights()
  set_quantisation()
  lbl = document.getElementById('quant')
  tri = use_triplets ? ' triplets' : ' norm'
  lbl.innerHTML = "1/" + quant.toString() + tri
}

function set_use_quant(e) {
  use_quant = e.srcElement.parentElement.state
}