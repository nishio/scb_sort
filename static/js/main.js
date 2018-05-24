var pages;
var a_day = 60 * 60 * 24 * 1000;
var a_year =  a_day * 365;

function get_data(){
  // MUST be same origin
  $.ajax({
    type: 'GET',
    dataType: "json",

    url: "https://scrapbox.io/api/pages/nishio",
    //  url: "/static/data/nishio.json",
    data: {limit: 10000},
    success: success,
  })
}


function sort_periodic(x){
  var now = Date.now();
  var updated = x['updated'] * 1000;
  if(now - updated < a_year){
    x['sort-order'] = a_year + (now - updated);
  }else{
    x['sort-order'] = (now - updated) % a_year;
  }
}

function sort_log(x){
  var now = Date.now();
  var updated = x['updated'] * 1000;
  var diff = now - updated;
  var ret;
  if(diff < 10 * a_day){
    ret = a_year;
//    x['sort-pprint'] = null;
  }else{
    diff = diff / (10 * a_day);
    ret = (Math.log(diff) / Math.log(2)) % 1;
    x['sort-pprint'] = Math.floor(diff * 10);
  }
  x['sort-order'] = ret;
}

function fail(x){
  btn.button('error');
}

function success(x){
  console.log(x);

  pages = x['pages'];

  pages.forEach(sort_log)
  pages.sort(function(a, b){
    return a['sort-order'] - b['sort-order'];
  })

  for(var i=0; i < 100; i++){
    var title = pages[i]['title'];
    var updated = new Date(pages[i]['updated'] * 1000);
    $("#pages").append(
      $("<li>").append(
        strftime(updated),
        "(" + pages[i]['sort-pprint'] + ")",
        $("<a>").text(title).attr('href', 'https://scrapbox.io/nishio/' + title)
      )
    );
  }
}



$('#btn-run')
  .click(function (e) {
    var btn = $(this)
    btn.button('loading')
    try{
      var x = JSON.parse($("#textarea").val());
      success(x);
      btn.button('complete');
    }catch{
      btn.button('error');
    }
    e.preventDefault()
  }
);


function update(e){
  var val = $(this).val();
  $("#link-api").text("API: " + val).attr(
    "href", "https://scrapbox.io/api/pages/" + val + "?limit=10000"
  );
}
$('#text-project-name').change(update);
$('#text-project-name').keyup(update);




function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

function strftime(d){
  return (
    d.getUTCFullYear() +
      '-' + pad(d.getUTCMonth() + 1) +
      '-' + pad(d.getUTCDate())
  )
}
