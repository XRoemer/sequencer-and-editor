function test() {

  try {

    seq_div_extend.onmousemove = window_mousemove;
    seq_div_extend.onmouseup = window_mouseup;
    seq_div_extend.onwheel = window_scroll;

  }
  catch(e){log(e)}
}



function my_fkt(id) {
  log('toggle',id)
}

function myFunction(e){
  log('hier', e)
}
