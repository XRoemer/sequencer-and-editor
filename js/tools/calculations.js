

function midi2posX(bar, micro, cent) {
  var x = V.barlen * bar + V.miclen * micro + V.miclen/100 * cent
  return x
}
function row2posY(row) {
  var y = V.win_h - row * V.elem_h - V.elem_h
  return y
}

function posX2midi(x) {
  if (!V.use_quant){
    var bar = Math.trunc(x / V.barlen) + 1
    var micro = Math.trunc( (x % V.barlen) / V.miclen) + 1
    var cent = Math.trunc( (x % V.miclen) / V.miclen * 100 )
    return {bar, micro, cent}
  } else {
    return posX2midi_quant(x)
  }
  
}
function posX2midi_quant(x) {
  var q = V.use_triplets ? V.quant + V.quant / 2 : V.quant
  var q2 = q / 4 * V.micro
  var div_mic = q / 4
  var divisions = Math.trunc(x / V.item_w)

  var bar = Math.trunc(divisions / q2)
  var micro = Math.trunc((divisions - bar * q2) / div_mic)
  var rest = divisions - bar * q2 - micro * div_mic
  var cent = Math.round(rest * 100 / (q/4))

  bar += 1
  micro += 1

  return {bar, micro, cent}
}

function posY2row(my){
  return Math.max(V.amount_rows - Math.trunc(my / V.elem_h) - 1, 0)
}

function calc_color(val, scope) {

  if (scope != null){
    var p = params.params[params.param]
    var [start, scope, step] = [p.start, p.scope, p.step]
    val = (val - start) / (scope) * 128
  }
  
  val = Math.min(val,127)
  
  if (val < 64) {
    var col1 = V.elem_cols[1]
    var col2 = V.elem_cols[0]
  }
  else {
    var col1 = V.elem_cols[2]
    var col2 = V.elem_cols[1]
  }
  var fak = (val % 64) / 63
  var fak2 = 1 - fak
  var r = Math.round(col1[0] * fak + col2[0] * fak2)
  var g = Math.round(col1[1] * fak + col2[1] * fak2)
  var b = Math.round(col1[2] * fak + col2[2] * fak2)
  var col = 'rgb('+ r +',' + g + ',' + b + ')'
  return col
}