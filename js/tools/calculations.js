

function midi2posX(bar, micro, cent) {
  var x = barlen * bar + miclen * micro + miclen/100 * cent
  return x
}

function posX2midi(x) {
  if (!use_quant){
    var bar = Math.trunc(x / barlen) + 1
    var micro = Math.trunc( (x % barlen) / miclen) + 1
    var cent = Math.trunc( (x % miclen) / miclen * 100 )
  } else {
    var pos = posX2midi_quant(x)
    var bar = pos.bar
    var micro = pos.micro
    var cent = pos.cent
  }
  return {bar, micro, cent}
}
function posX2midi_quant(x) {
  var q = use_triplets ? quant + quant / 2 : quant
  var div_mic = q / 4
  var divisions = Math.round(x / item_w)

  var bar = Math.trunc(divisions / q)
  var micro = Math.trunc((divisions - bar * q) / div_mic)
  var rest = divisions - bar * q - micro * div_mic
  var cent = Math.round(rest * 100 / (q/4))

  bar += 1
  micro += 1

  return {bar, micro, cent}
}

function posY2row(my){
  return amount_rows - Math.trunc(my / elem_h) - 1
}

function calc_color(vol) {
  if (vol < 64) {
    var col1 = elem_cols[1]
    var col2 = elem_cols[0]
  }
  else {
    var col1 = elem_cols[2]
    var col2 = elem_cols[1]
  }
  var fak = (vol % 64) / 63
  var fak2 = 1 - fak
  var r = Math.round(col1[0] * fak + col2[0] * fak2)
  var g = Math.round(col1[1] * fak + col2[1] * fak2)
  var b = Math.round(col1[2] * fak + col2[2] * fak2)
  var col = 'rgba('+r.toString()+','+g.toString()+','+b.toString()+',1)'
  return col
}