class Pointer {

  constructor() {
    this.pointer_x = 0
    this.pointer_count = 0
    this.scrolling = null
    this.bar_nr = 0
    this.mic_nr = 0
    this.mic_len_ms = 10
    this.scale_x_pos = 0
    this.loop_start = null
    this.loop_end = null
  }

  create_pointer(){
    var c = document.getElementById("pointer_div");
    c.innerHTML = ''
    var p = pointer_col
    var col = 'rgba('+p[0]+','+p[1]+','+p[2]+','+p[3]+')'
    this.pointer = create_stroke_svg(0, 0, pointer_w, win_h, pointer_w, col, 'pointer')
    c.appendChild(this.pointer)
    this.pointer_triad = create_triad(-7.5, -20, 20, 20, 1, col, 'pointer_triad')
    c.appendChild(this.pointer_triad)

    var x_right = 2 * item_w  + 1
    var x_left = item_w - 15 + 1

    this.loop_border_left = create_triad(x_left, -20, 15, 20, 1, 'black',
                                    'loop_bound_left', "orange", loop_bound_left)
    this.loop_border_right = create_triad(x_right, -20, 15, 20, 1, 'black',
                                    'loop_bound_right', "orange", loop_bound_right)

    loop_bounds_div.appendChild(this.loop_border_left)
    loop_bounds_div.appendChild(this.loop_border_right)
    this.loop_border_right.addEventListener("mousedown", this.loop_bounds_fkt)
    this.loop_border_left.addEventListener("mousedown", this.loop_bounds_fkt)

    this.add_listeners_to_x_scale(div_scale_x)
  }


  set_position(x) {
    this.pointer.style.left = x
    this.pointer_triad.style.left = x - 6.5
  }

  move_pointer(val){

    if (val[0] == 'stop'){
      this.stop_pointer()
      var c = window.document.getElementById('play')
      c.style.fill = 'rgb(128,0,64)'
      return
    }
    this.bar_nr = val[1] - 1
    this.mic_nr = val[2] - 1
    this.cutoff = val[3]
    this.mic_len_ms = val[4]
    this.pointer_x = barlen * this.bar_nr + miclen * this.mic_nr
    this.pointer_count = 0

    if(this.scrolling){
      this.stop_pointer()
    }
    this.scrolling = setInterval(function()
      {this.scroll_pointer(this)}.bind(this), this.mic_len_ms/30);
  }

  scroll_pointer(p){
    p.pointer_count += 1
    var cutoff = 0
    if (this.cutoff > 0){
      cutoff = this.cutoff / 100 * elem_w
    }
    p.pointer_x = barlen * p.bar_nr + miclen * p.mic_nr
                + miclen / 30 * p.pointer_count + cutoff
    p.set_position(p.pointer_x)
    var x_scroll = p.pointer_x - window_w / 2

    if (x_scroll > window.scrollX ) {
      window.scrollTo(x_scroll, window.scrollY)
    } else if(p.pointer_x < window.scrollX){
      window.scrollTo(p.pointer_x, window.scrollY)
    }
  }

  stop_pointer(){
    clearInterval(this.scrolling)
    this.scrolling = null
  }

  loop_bounds_fkt(e) {
    if (e.srcElement.parentElement.id == 'loop_bound_right') {
      loop_bound_right_clicked = true
    } else if (e.srcElement.parentElement.id == 'loop_bound_left') {
      loop_bound_left_clicked = true
    }
  }
  move_bounds(x, type) {

    if (!type) {
      x += window.scrollX
    }
    if (loop_bound_right_clicked || type == 'right') {
      var x = Math.min(x, win_w)
      var pos_left = Number(this.loop_border_left.style.left.replace('px',''))
      x = Math.max(x, pos_left + 15 )
      if (use_quant) {
        x = Math.floor((x) / item_w) * item_w
        var pos = posX2midi(x)
      }
      var pos = posX2midi(x)
      send_data('player loop_end ' + pos.bar + ' ' +
              pos.micro + ' ' + pos.cent, window.win_nr)
      this.loop_border_right.style.left = x + 1
    } else {
      var x = Math.max(x, 0)
      var pos_right = Number(this.loop_border_right.style.left.replace('px',''))
      x = Math.min(x, pos_right - 2)
      if (use_quant) {
        x = Math.floor(x / item_w) * item_w
      }
      this.loop_border_left.style.left = x - 14
      var pos = posX2midi(x)
      send_data('player loop_start ' + pos.bar + ' ' +
              pos.micro + ' ' + pos.cent, window.win_nr)
    }
  }


  add_listeners_to_x_scale(el) {

    el.addEventListener("mousemove", e => {
      var b = window.document.getElementById("div_scale_x")
      var mx = e.clientX - b.offsetLeft + window.scrollX
      this.scale_x_pos = posX2midi(mx)
    })

    el.addEventListener("mousedown", e => {
      if (!ctrl_pressed && !alt_pressed) {
        var pos = this.get_x_pos(this.scale_x_pos)
        this.set_position(pos.x)
        send_data('player pointer_start ' + this.scale_x_pos.bar + ' ' +
                this.scale_x_pos.micro + ' ' + pos.cent, window.win_nr)
      } else {
        var x = this.get_x_pos(this.scale_x_pos).x
        if (ctrl_pressed) {
          this.move_bounds(x,'left')
        } else if (alt_pressed) {
          this.move_bounds(x,'right')
        }
      }

    })
  }

  get_x_pos(midi_pos) {
    if (use_quant) {
      var cent = 0
      if (quant > 4) {
        var res = quant_cents.filter(x => midi_pos.cent >= x )
        cent = res[res.length - 1]
      }
      var x = (midi_pos.bar - 1) * barlen + (midi_pos.micro - 1) * miclen
              + miclen * cent / 100
    } else {
      var x = (midi_pos.bar - 1) * barlen + (midi_pos.micro - 1) * miclen
      + miclen * midi_pos.cent / 100
      cent = midi_pos.cent

    }
    return {x,cent}
  }

}
