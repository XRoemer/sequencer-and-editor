class Pointer {

  constructor() {
    this.pointer_x = 0
    this.pointer_count = 0
    this.scrolling = null
    this.bar_nr = 0
    this.mic_nr = 0
    this.mic_len_ms = 1000
    this.scale_x_pos = {bar:0,micro:1,cent:0}
    this.loop_start_x = 0
    this.loop_start_midi = {bar:1,micro:1,cent:0}
    this.loop_end_x = V.win_w / 4
    this.loop_end_midi = {bar:2,micro:1,cent:0}
    this.scroll_window = true
  }

  create_pointer(){
    this.create_transport()
    this.create_loop_bounds()
    this.add_listeners_to_x_scale(div_scale_x)
  }
  
  create_loop_bounds(){
    var x_right = this.loop_end_x
    var x_left = this.loop_start_x

    this.loop_border_left = sf.create_triad(x_left, 0, 15, 20, 1, 'black',
                                    'svg_str.loop_bound_left', "orange", svg_str.loop_bound_left)
    this.loop_border_right = sf.create_triad(x_right, 0, 15, 20, 1, 'black',
                                    'svg_str.loop_bound_right', "orange", svg_str.loop_bound_right)
    this.set_loop_start(x_left)
    this.set_loop_end(x_right)

    loop_bounds_div.appendChild(this.loop_border_left)
    loop_bounds_div.appendChild(this.loop_border_right)
    this.loop_border_right.addEventListener("mousedown", this.loop_bounds_fkt)
    this.loop_border_left.addEventListener("mousedown", this.loop_bounds_fkt)
  }
  
  create_transport(){
    var p = V.pointer_col
    var col = 'rgba('+p[0]+','+p[1]+','+p[2]+','+p[3]+')'
    this.pointer = sf.create_stroke_svg(0, 20, V.pointer_w, V.win_h, V.pointer_w, col, 'pointer_stroke')
    pointer_div.appendChild(this.pointer)
    this.pointer_triad = sf.create_triad(-7.5, 0, 20, 20, 1, col, 'pointer_triad')
    pointer_div.appendChild(this.pointer_triad)
  }
  
  adjust_transport_stroke(){
    pointer_div.removeChild(pointer_stroke)
    var p = V.pointer_col
    var col = 'rgba('+p[0]+','+p[1]+','+p[2]+','+p[3]+')'
    this.pointer = sf.create_stroke_svg(0, 20, V.pointer_w, V.win_h, V.pointer_w, col, 'pointer_stroke')
    pointer_div.appendChild(this.pointer)
    this.set_position(this.pointer_x)
  }


  set_position(x) {
    this.pointer_x = x
    this.pointer.style.left = x - window.scrollX
    this.pointer_triad.style.left = x - 6.5 - window.scrollX
  }

  move_pointer(val){
    this.a += 1
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
    this.pointer_x = V.barlen * this.bar_nr + V.miclen * this.mic_nr
    this.pointer_count = 0
    
    this.set_position(this.pointer_x)

    if(this.scrolling){
      this.stop_pointer()
    }
    this.scrolling = setInterval(function()
      {this.scroll_pointer(this)}.bind(this), this.mic_len_ms/V.update_freq);
  }

  scroll_pointer(p){
    p.pointer_count += 1
    var cutoff = 0
    if (this.cutoff > 0){
      cutoff = this.cutoff / 100 * V.elem_w
    }
    p.pointer_x = V.barlen * p.bar_nr + V.miclen * p.mic_nr
                + V.miclen / V.update_freq * p.pointer_count + cutoff
    p.set_position(p.pointer_x)
    var x_scroll = p.pointer_x - V.window_w / 2

    if (this.scroll_window) {
      if (x_scroll > window.scrollX ) {
        window.scrollTo({left:x_scroll})
      } else if(p.pointer_x < window.scrollX){
        window.scrollTo({left:p.pointer_x})
      }
    }
  }

  stop_pointer(){
    clearInterval(this.scrolling)
    this.scrolling = null
  }

  loop_bounds_fkt(e) {
    if (e.srcElement.parentElement.id == 'svg_str.loop_bound_right') {
      V.loop_bound_right_clicked = true
    } else if (e.srcElement.parentElement.id == 'svg_str.loop_bound_left') {
      V.loop_bound_left_clicked = true
    }
  }
  move_bounds(x, type, dont_send) {
    
    if (!type) {
      x += window.scrollX
    }
    player.set_col_active('loop_bounds')

    if (V.loop_bound_right_clicked || type == 'right') {
      var x = Math.min(x, V.win_w)
      x = Math.max(x, this.loop_start_x )
      if (V.use_quant) {
        x = Math.floor((x) / V.item_w) * V.item_w
        var pos = posX2midi(x)
      }
      this.set_loop_end(x)
      var pos = this.loop_end_midi
      if(dont_send == null){
      data.send_data('player loop_end ' + pos.bar + ' ' +
              pos.micro + ' ' + pos.cent, window.win_nr)
      }
    } else {
      var x = Math.max(x, 0)
      x = Math.min(x, this.loop_end_x)
      if (V.use_quant) {
        x = Math.floor(x / V.item_w) * V.item_w
      }
      this.set_loop_start(x)
      var pos = this.loop_start_midi
      if(dont_send == null){
        data.send_data('player loop_start ' + pos.bar + ' ' +
                pos.micro + ' ' + pos.cent, window.win_nr)
      }
    }
  }
  
  set_loop_start(x){
    this.set_loop_start_x(x)
    this.loop_start_midi = posX2midi(x)
    this.loop_border_left.style.visibility  = 'visible'
  }
  
  set_loop_start_x(x){
    this.loop_start_x = x
    this.loop_border_left.style.left = x - 14 - window.scrollX
  }
  
  set_loop_end(x){
    this.set_loop_end_x(x)
    this.loop_end_midi = posX2midi(x)
    this.loop_border_right.style.visibility  = 'visible'
  }
  
  set_loop_end_x(x){
    this.loop_end_x = x
    this.loop_border_right.style.left = x + 1 - window.scrollX
  }

  add_listeners_to_x_scale(el) {

    el.addEventListener("mousemove", e => {
      var mx = e.clientX - V.scaleY_w + window.scrollX
      this.scale_x_pos = posX2midi(mx)
      main.show_mouse_pos(this.scale_x_pos.bar,this.scale_x_pos.micro,this.scale_x_pos.cent,-2)
    })

    el.addEventListener("mousedown", e => {
      if (!e.ctrlKey && !e.altKey) {
        var pos = this.get_x_pos(this.scale_x_pos)
        this.set_position(pos.x)
        this.pointer_x = pos.x
        this.pointer.style.visibility  = 'visible'
        this.pointer_triad.style.visibility  = 'visible'
        player.set_col_inactive('loop_bounds')
        data.send_data('player pointer_start ' + this.scale_x_pos.bar + ' ' +
            this.scale_x_pos.micro + ' ' + pos.cent, window.win_nr)
      } else {
        var x = e.clientX - V.scaleY_w + window.scrollX
        if (e.ctrlKey) {
          this.move_bounds(x,'left')
        } else if (e.altKey) {
          this.move_bounds(x,'right')
        }
      }

    })
  }

  get_x_pos(midi_pos) {
    if (V.use_quant) {
      var cent = 0
      if (V.quant > 4) {
        var res = V.quant_cents.filter(x => midi_pos.cent >= x )
        cent = res[res.length - 1]
      }
      var x = (midi_pos.bar - 1) * V.barlen + (midi_pos.micro - 1) * V.miclen
              + V.miclen * cent / 100 
    } else {
      var x = (midi_pos.bar - 1) * V.barlen + (midi_pos.micro - 1) * V.miclen
      + V.miclen * midi_pos.cent / 100 
      cent = midi_pos.cent

    }
    return {x,cent}
  }

}
