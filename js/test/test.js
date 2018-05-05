function test() {

  try {

   
    log(items.dict)
    log(items.items_by_row)
    
  }
  catch(e){log(e)}
}



function my_fkt(id) {
  var keys = Object.keys(id)
  log(keys)
}

function myFunction(e){
  log('hier', e)
}
