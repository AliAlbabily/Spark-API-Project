
// test request
$(document).ready(function () {
  $.ajax({
        method: "GET",
        url: 'http://localhost:5000/song',
        headers: {"Accept": "application/json"}
      })
      .done(function (data) {
        console.log(data);
      });
});