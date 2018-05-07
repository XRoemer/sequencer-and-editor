class Pointer {

  constructor() {
    this.pointer_x = 0
    this.pointer_count = 0
    this.scrolling = null
    this.bar_nr = 0
    this.mic_nr = 0
    this.mic_len_ms = 10
    this.scale_x_pos = {bar:0,micro:1,cent:0}
    this.loop_start_x = null
    this.loop_start_midi = {bar:1,micro:1,cent:0}
    this.loop_end_x = null
    this.loop_end_midi = {bar:1,micro:2,cent:0}
    this.scroll_window = true
    
    this.a = 0
    this.b = 0
  }

  create_pointer(){
    var c = document.getElementById("pointer_div");
    c.innerHTML = ''
    var p = pointer_col
    var col = 'rgba('+p[0]+','+p[1]+','+p[2]+','+p[3]+')'
    this.pointer = create_stroke_svg(0, 20, pointer_w, win_h, pointer_w, col, 'pointer')
    c.appendChild(this.pointer)
    this.pointer_triad = create_triad(-7.5, 0, 20, 20, 1, col, 'pointer_triad')
    c.appendChild(this.pointer_triad)

    var x_right = 2 * item_w  
    var x_left = item_w 

    this.loop_border_left = create_triad(x_left, 0, 15, 20, 1, 'black',
                                    'loop_bound_left', "orange", loop_bound_left)
    this.loop_border_right = create_triad(x_right, 0, 15, 20, 1, 'black',
                                    'loop_bound_right', "orange", loop_bound_right)
    this.set_loop_start(x_left)
    this.set_loop_end(x_right)

    loop_bounds_div.appendChild(this.loop_border_left)
    loop_bounds_div.appendChild(this.loop_border_right)
    this.loop_border_right.addEventListener("mousedown", this.loop_bounds_fkt)
    this.loop_border_left.addEventListener("mousedown", this.loop_bounds_fkt)

    this.add_listeners_to_x_scale(div_scale_x)
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
    this.b += 1
    var cutoff = 0
    if (this.cutoff > 0){
      cutoff = this.cutoff / 100 * elem_w
    }
    p.pointer_x = barlen * p.bar_nr + miclen * p.mic_nr
                + miclen / 30 * p.pointer_count + cutoff
    p.set_position(p.pointer_x)
    var x_scroll = p.pointer_x - window_w / 2

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
    player.set_col_active('loop_bounds')

    if (loop_bound_right_clicked || type == 'right') {
      var x = Math.min(x, win_w)
      x = Math.max(x, this.loop_start_x )
      if (use_quant) {
        x = Math.floor((x) / item_w) * item_w
        var pos = posX2midi(x)
      }
      this.set_loop_end(x)
      var pos = this.loop_end_midi
      send_data('player loop_end ' + pos.bar + ' ' +
              pos.micro + ' ' + pos.cent, window.win_nr)
    } else {
      var x = Math.max(x, 0)
      x = Math.min(x, this.loop_end_x)
      if (use_quant) {
        x = Math.floor(x / item_w) * item_w
      }
      this.set_loop_start(x)
      var pos = this.loop_start_midi
      send_data('player loop_start ' + pos.bar + ' ' +
              pos.micro + ' ' + pos.cent, window.win_nr)
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
      var mx = e.clientX - 40 + window.scrollX
      this.scale_x_pos = posX2midi(mx)
      show_mouse_pos(this.scale_x_pos.bar,this.scale_x_pos.micro,this.scale_x_pos.cent,-2)
    })

    el.addEventListener("mousedown", e => {
      if (!ctrl_pressed && !alt_pressed) {
        var pos = this.get_x_pos(this.scale_x_pos)
        this.set_position(pos.x)
        this.pointer_x = pos.x
        this.pointer.style.visibility  = 'visible'
        this.pointer_triad.style.visibility  = 'visible'
        player.set_col_inactive('loop_bounds')
        send_data('player pointer_start ' + this.scale_x_pos.bar + ' ' +
            this.scale_x_pos.micro + ' ' + pos.cent, window.win_nr)
      } else {
        x = e.clientX - 40 + window.scrollX
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
