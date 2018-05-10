function test() {

  try {
    
    log(items.dict)
    
  }
  catch(e){log(e)}
}

function measure_fkt2(fkt,args) {
  var t0 = performance.now();
  //
  items.set_items(val_array)
  params.set_items()
  var t1 = performance.now();
  console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
}

