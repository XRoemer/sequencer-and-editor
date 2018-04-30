function test() {




  // var cont = window.document.getElementById('container')
  // cont.style.zoom="80%"
  try {


    var btn = hide

    var attr =  "translate(-135 -135) scale(0.1) rotate(180)"
    hide.setAttribute("transform", attr);
    log(hide)


  }
  catch(e){log(e)}
}
