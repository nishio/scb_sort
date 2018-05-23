var pages;


$('#btn-run')
  .click(function (e) {
    var btn = $(this)
    btn.button('loading')

    $.ajax({
      type: 'GET',
      dataType: "json",

//      url: "https://scrapbox.io/api/pages/nishio",
      url: "/static/data/nishio.json",

      data: {limit: 10000},
      xhrFields: {
        withCredentials: false
      },
      success: function(x){
        console.log(x);

        btn.button('complete');
        pages = x['pages'];

        var now = Date.now();
        var a_day = 60 * 60 * 24 * 1000;
        var a_year =  a_day * 365;
        function f1(x){
          var updated = x['updated'] * 1000;
          if(now - updated < a_year){
            x['sort-order'] = a_year + (now - updated);
          }else{
            x['sort-order'] = (now - updated) % a_year;
          }
        }
        function f2(x){
          var updated = x['updated'] * 1000;
          var diff = now - updated;
          var ret;
          if(diff < 10 * a_day){
            ret = a_year;
          }else{
            diff = diff / (10 * a_day);
            ret = (Math.log(diff) / Math.log(2)) % 1;
            x['sort-pprint'] = Math.floor(diff * 10);
          }
          x['sort-order'] = ret;
        }
        pages.forEach(f2)

        pages.sort(function(a, b){
          return a['sort-order'] - b['sort-order'];
        })
        for(var i=0; i < 100; i++){
          var title = pages[i]['title'];
          var updated = new Date(pages[i]['updated'] * 1000);
          $("#pages").append(
            $("<li>").append(
              strftime(updated),
              //" " + pages[i]['sort-order'],
              "(" + pages[i]['sort-pprint'] + ")",
              $("<a>").text(title).attr('href', 'https://scrapbox.io/nishio/' + title)
            )
          );
        }
      }
    }).fail(function() {
      btn.button('error');
    });
    e.preventDefault()
  }
);

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
