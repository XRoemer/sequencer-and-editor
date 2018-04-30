
var quant = 8 // -> 1 2 4 8 16 32 64 128
var quant_cents = [] // set in set_widths_and_heights in init.js
var use_quant = false
var use_triplets = false

var amount_bars = 4
var micro = 4

// sequencer canvas size
var win_h = 500
var win_w = 1600
// browser size
var window_h = 300
var window_w = 650

var pointer_w = 3
var pointer_col = [0,100,0,1]

var elem_h = 10 // set on init
var elem_w = 10 // set on init
var item_w = 10 // set on init

var vol = 80 // global var to set vol for new items to last item

var amount_rows = 20
var line_design = 0 // 0,1,2,3: piano, iter, group of 4, group of 5

var elem_cols = [ [205,213,229], [255,255,197], [107,31,69] ]
var line_layouts = [
  [0,-1,2,-1,4,5,-1,7,-1,9,-1,11],
  [0,-1],
  [0,1,2,3,],
  [0,1,2,3,4]
]

var open_windows = {}

initialized = false
ctrl_pressed = false
shift_pressed = false
alt_pressed = false

loop_bound_left_clicked = false
loop_bound_right_clicked = false

var log_receive = false
var log_send = false
