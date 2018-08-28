$(function(){
  function formDataToJSON(formArray) {
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++){
      returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return JSON.stringify(returnArray);
  }

  // call back function when getting players successfully
  function onSucessGetPlayerCallback(jsonResponse){
    var players = jsonResponse.players;
    if (players.length > 0){
      var html = '';
      $.each(players,function(index,player){
        html += '<tr player-id="' + player.id + '">' +
                  '<td>' + player.first_name + '</td>' +
                  '<td>' + player.last_name + '</td>' +
                  '<td>' + player.rating + '</td>' +
                  '<td>' + player.handedness + '</td>' +
                  '<td><button type="button" class="btn btn-danger delete-player">Delete</button></td>' + 
                '</tr>';
      });
      $('#players-container table tbody').append(html);
      $('#players-container table').removeClass('hidden');
    } else{
      $('#players-container').children('.no-player').removeClass('hidden');
    }
  }
  /*
    @param: message(string): message to show
    @param: timer(number)(optional): if exist, the alert will disappear after timer
  */
  function showSuccessAlert(message,timer){
    $('.alert-success').text(message);
    $('.alert-success').removeClass('hidden');
    $('.alert-danger').addClass('hidden');
    if (timer){
      setTimeout(function(){
        $('.alert-success').addClass('hidden');
      },timer);
    }
  }
  /*
    @param: message(string): message to show
    @param: timer(number)(optional): if exist, the alert will disappear after timer
  */
  function showErrorAlert(message,timer){
    $('.alert-danger').text(message);
    $('.alert-danger').removeClass('hidden');
    $('.alert-success').addClass('hidden');
    if (timer){
      setTimeout(function(){
        $('.alert-danger').addClass('hidden');
      },timer);
    }
  }

  // login form submit
  $('#login-form').submit(function(e) {
    var form = $('#login-form');
    var url = form.attr('action');
    $.ajax({
      type: 'POST',
      beforeSend: function(request) {
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      },
      url: url,
      data: formDataToJSON(form.serializeArray()),
      success: function(jsonResponse){
        var token = jsonResponse.token;
        var user = jsonResponse.user;
        localStorage.setItem('token',token);
        localStorage.setItem('user',JSON.stringify(user));
        window.location.href = '/players.html';
      },
      error: function(jqXHR,textStatus,errorThrown){
        var responseObject = JSON.parse(jqXHR.responseText);
        var message = responseObject.error.message;
        showErrorAlert(message);
      }
    });
    e.preventDefault(); // avoid to execute the actual submit of the form.
  });

  // registration form submit
  $('#registration-form').submit(function(e) {
    var form = $('#registration-form');
    var url = form.attr('action');
    $.ajax({
      type: 'POST',
      beforeSend: function(request) {
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      },
      url: url,
      data: formDataToJSON(form.serializeArray()),
      success: function(jsonResponse){
        var token = jsonResponse.token;
        var user = jsonResponse.user;
        localStorage.setItem('token',token);
        localStorage.setItem('user',JSON.stringify(user));
        showSuccessAlert('Successful Registration. You will be redirected to Players page');
        setTimeout(function(){
          window.location.href = '/players.html';
        },3000);
      },
      error: function(jqXHR,textStatus,errorThrown){
        var responseObject = JSON.parse(jqXHR.responseText);
        var message = responseObject.error.message;
        showErrorAlert(message);
      }
    });
    e.preventDefault(); // avoid to execute the actual submit of the form.
  });

  // add new player form submit
  $('#add-new-player').submit(function(e) {
    var token = localStorage.getItem('token');
    var form = $('#add-new-player');
    var url = form.attr('action');
    $.ajax({
      type: 'POST',
      beforeSend: function(request) {
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        request.setRequestHeader('Authorization', 'Bearer ' + token);
      },
      url: url,
      data: formDataToJSON(form.serializeArray()),
      success: function(jsonResponse){
        var player = jsonResponse.player;
        $('#players-container table tbody').append('<tr player-id="' + player.id + '">' +
                                                      '<td>' + player.first_name + '</td>' +
                                                      '<td>' + player.last_name + '</td>' +
                                                      '<td>' + player.rating + '</td>' +
                                                      '<td>' + player.handedness + '</td>' +
                                                      '<td><button type="button" class="btn btn-danger delete-player">Delete</button></td>' + 
                                                    '</tr>');
        $('#players-container').children('.no-player').addClass('hidden');
        $('#players-container').children('table').removeClass('hidden');
        showSuccessAlert('Player added successfully');
      },
      error: function(jqXHR,textStatus,errorThrown){
        var responseObject = JSON.parse(jqXHR.responseText);
        var message = responseObject.error.message;
        showErrorAlert(message);
      }
    });
    e.preventDefault(); // avoid to execute the actual submit of the form.
  });

  // delete player button
  $(document).on('click','.delete-player',function(){
    var playerRowElement = $(this).parents('tr');
    var playerId = playerRowElement.attr('player-id');
    var token = localStorage.getItem('token');
    var url = 'https://players-api.developer.alchemy.codes/api/players/' + playerId
    $.ajax({
      type: 'DELETE',
      beforeSend: function(request) {
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        request.setRequestHeader('Authorization', 'Bearer ' + token);
      },
      url: url,
      success: function(jsonResponse){
        playerRowElement.remove();
        if ($('#players-container table tbody tr').length === 0){
          $('#players-container .no-player').removeClass('hidden');
          $('#players-container table').addClass('hidden');
        }
        showSuccessAlert('Player deleted successfully');
      },
      error: function(jqXHR,textStatus,errorThrown){
        var responseObject = JSON.parse(jqXHR.responseText);
        var message = responseObject.error.message;
        showErrorAlert(message);
      }
    });
  });

  // Players page only
  if(window.location.pathname === '/players.html'){
    var token = localStorage.getItem('token');
    var user = JSON.parse(localStorage.getItem('user'));
    $.ajax({
      type: 'GET',
      beforeSend: function(request) {
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        request.setRequestHeader('Authorization', 'Bearer ' + token);
      },
      url: 'https://players-api.developer.alchemy.codes/api/players',
      success: onSucessGetPlayerCallback,
      error: function(jqXHR,textStatus,errorThrown){
        if(jqXHR.status === 403){
          showErrorAlert("Session expired. Please login again");
          setTimeout(function(){
            window.location.href = "/login.html";
          },3000);
        }
      }
    });

    if (user){
      $('#user').text(user.first_name + ' ' + user.last_name);
    }
    $('.logout').on('click',function(){
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = "/index.html";
    });
  }
});