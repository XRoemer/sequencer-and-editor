






//function window_mouseup(e) {
//  log(e)
//  if (loop_bound_left_clicked || loop_bound_right_clicked) {
//    loop_bound_left_clicked = false
//    loop_bound_right_clicked = false
//  }
//  window.dragging = false
//}

//function window_scroll(e) {
//  if(ctrl_pressed) {
//    var scrollX_old = window.scrollX
//    var rel = win_w / scrollX_old
//    win_w += e.deltaY
//    win_w = Math.max(600,win_w)
//    var scrollX_new = win_w / rel
//    scale_seqgui()
//    window.scrollTo(scrollX_new, window.srollY)
//    send_data('settings win_size_w ' + win_w, window.win_nr)
//  }
//}
