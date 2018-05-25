class Solo_Mute {
  constructor(){
  }
  
  init(){
    this.solo_states = {}
    this.mute_states = {}
    this.muted = {}
    for( var i = 0; i < V.amount_rows; i++) this.muted[i] = false
  }
  set_muted(val){
    var th = this
    // set muted is called by loading a preset
    // needs to be delayed as it would be overwritten 
    // by initialization
    setTimeout(function(){ 
      for( var i = 0; i < val.length; i++) {
        th.muted[i] = val[i] * 1
        th.mute_states['mute'+i].state = val[i] * 1
        params.set_items()
      }
    th.set_states()
    }, 200)
    
  }
  
  create_solo_mute_btns(y, w, h ,nr){
    var solo = SVGs.create_btn(2,y,w,h,'solo' + nr,'button',this.toggle_solo.bind(this),false)
    div_solo_mute.appendChild(solo)
    this.solo_states['solo' + nr] = solo
    solo.state = false
    
    var mute = SVGs.create_btn(14,y,w,h,'mute' + nr,'button',this.toggle_mute.bind(this),false)
    div_solo_mute.appendChild(mute)
    this.mute_states['mute' + nr] = mute
    mute.state = false    
  }
  
  toggle_solo(e){
    var el = e.srcElement.parentElement
    var els
    el.state = !el.state

    if (el.state && e.ctrlKey) {
      for( var i = 0; i < Object.keys(this.solo_states).length; i++){
	els = this.solo_states['solo'+i]
	if (els != el) els.state = false
      }
    }
    this.set_states()
  }
  toggle_mute(e){
    var el = e.srcElement.parentElement
    el.state = !el.state
    this.set_states()
  }
  
  set_col_solo(el,state) {
    if (state) el.style.fill = 'orange'
    else el.style.fill = V.col_btn_inactive
  }
  set_col_mute(el,state) {
    if (state) {el.style.fill = 'grey'}
    else el.style.fill = V.col_btn_inactive
  }
  reset_all(){
    for( var i = 0; i < Object.keys(this.solo_states).length; i++){
      var els = this.solo_states['solo'+i]
      var elm = this.mute_states['mute'+i]
      els.state = false
      elm.state = false
      } 
    this.set_states()
  }
  
  set_states(){
    var solo = false
    var els, elm
    var solo_keys = Object.keys(this.solo_states)
    var mute_keys = Object.keys(this.mute_states)
    
    for( var i = 0; i < solo_keys.length; i++){
      els = this.solo_states['solo'+i]
      if (els.state) {
	solo = true
	break
      }
    }
    if (solo){
      for( var i = 0; i < solo_keys.length; i++){
        els = this.solo_states['solo'+i]
        elm = this.mute_states['mute'+i]
        if (els.state) {
          this.set_col_solo(els,true)
  	  this.set_col_mute(elm,false)
  	  this.muted[i] = false
        } else {
          this.set_col_solo(els,false)
  	  this.set_col_mute(elm,true)
  	  this.muted[i] = true
        }
      }
    } else {
      for( var i = 0; i < solo_keys.length; i++){
        els = this.solo_states['solo'+i]
        elm = this.mute_states['mute'+i]
        if (elm.state) {
          this.set_col_solo(els,false)
  	  this.set_col_mute(elm,true)
  	  this.muted[i] = true
        } else {
          this.set_col_solo(els,false)
  	  this.set_col_mute(elm,false)
  	  this.muted[i] = false
        }
      }
    }
    this.send_states()
    params.set_items()
  }
  
  send_states(){
    var states = []
  
    for( var i = 0; i < Object.keys(this.solo_states).length; i++){
      states.push(this.muted[i] * 1)
    }
    data.send_muted(states)
  }
}

var sm = new Solo_Mute()

