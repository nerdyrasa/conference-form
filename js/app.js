(function () {
  "use strict";
  /* The following line is to get rid of an error in webstorm */
  /*globals $:false */

  var $name = $("#name");
  var $mail = $("#mail");
  var $payment = $("#payment");

  var nameError = false;
  var emailError = false;
  var activityError = true;
  var paymentError = false;
  var creditCardError = false;
  var zipError = false;
  var cvvError = false;

  var errors = [];

  // set focus to the first form element
  $name.focus();

  // hide the other-title and only reveal it if "Other" is selected in the drop down
  $("#other-title").addClass("is-hidden");


  // Set the credit card expiration month to November -- I realize that this is brittle and just a temporary fix
  // Of course, the credit card information section would need to be much more robust to be "live"
  $('#exp-month option[value=11]').attr('selected','selected');

  /* --------------------------------------------------------------------------

   T-Shirt Selection

   No color options appear in the “Color” menu until the user chooses a T-Shirt theme.
   The Color menu reads “Please select a T-shirt theme” until a theme is selected from the “Design” menu.
   T-shirt color options are revealed based on the design selected.

   ----------------------------------------------------------------------------- */

  // color menu is hidden until a theme is selected
  $('#colors-js-puns').addClass('is-hidden');


  $('#design').on("change", (function () {
    var designSelection = $(this).val();

    // load only appropriate colors for the design
    $('#colors-js-puns').removeClass('is-hidden');
    if (designSelection === "js puns") {
      $('#color')
        .find('option')
        .remove()
        .end()
        .append('<option value="cornflowerblue">Cornflower Blue (JS Puns shirt only)</option>')
        .append('<option value="darkslategrey">Dark Slate Grey (JS Puns shirt only)</option>')
        .append('<option value="gold">Gold (JS Puns shirt only)</option>')
      ;

    } else if (designSelection === "heart js") {
      $('#color')
        .find('option')
        .remove()
        .end()
        .append('<option value="tomato">Tomato (I &#9829; JS shirt only)</option>')
        .append('<option value="steelblue">Steel Blue (I &#9829; JS shirt only)</option>')
        .append('<option value="dimgrey">Dim Grey (I &#9829; JS shirt only)')
      ;
    }
    //$('#color').focus();

  }));

  /* --------------------------------------------------------------------------
   Job Role: Other

   if other is selected in the drop down, reveal the other-title text input so the user
   can type in their job role; hide this field otherwise

   ----------------------------------------------------------------------------- */

  $("#title").change(function(){
    console.log("change");
    if ($("#title").val() === "other") {
      console.log("1");
      $("#other-title").removeClass("is-hidden");
    } else {
      $("#other-title").addClass("is-hidden");
    }
  });

  /* --------------------------------------------------------------------------

   Register for Activities Section

   Some events are at the same time as others. If the user selects a workshop, don't allow selection of a workshop at the same date and time --
   you should disable the checkbox and visually indicate that the workshop in the competing time slot isn't available.
   When a user deselects an activity, make sure that competing activities (if there are any) are no longer disabled.

   As a user selects activities to register for, a running total is listed below the list of checkboxes.
   For example, if the user selects "Main conference" then Total: $200 should appear.
   If they add 1 workshop, the total should change to Total: $300.

   Keep track of activities for validation on submit. User must have at least one activity
   selected to register.

   ----------------------------------------------------------------------------- */

  var activities = [];

  var totalCost = 0.00;

  if (activities.length > 0) {
    $(".total").removeClass("is-hidden");
  } else {
    $(".total").addClass("is-hidden");
  }

  $("input[type=checkbox]").each(function () {
    $(this).change(function () {

      var activity = $(this).attr("name");
      var session = $(this).attr("data-type");
      var itemCost = parseInt($(this).attr("data-cost"));

      var allItemsOfType = $(' input[data-type="' + session + '"] ');
      var allItemsOfTypeNotChecked = allItemsOfType.not(':checked');

      if ($(this).is(":checked")) {

        allItemsOfTypeNotChecked.prop("disabled", true);
        allItemsOfTypeNotChecked.parent().addClass("unavailable-activity");

        activities.push(activity);
        totalCost += itemCost;

      } else {

        var index = $.inArray(activity, activities);
        activities.splice(index, 1);

        totalCost -= itemCost;
        allItemsOfTypeNotChecked.prop("disabled", false);
        allItemsOfTypeNotChecked.parent().removeClass("unavailable-activity");

      }

      if (activities.length > 0) {
        $(".total").removeClass("is-hidden");
      } else {
        $(".total").addClass("is-hidden");
      }
      $('.dollar-amt').text(totalCost);

    });
  });

  /* --------------------------------------------------------------------------

   Payment Info Section

   "Credit Card" is visible by default. Other divs are revealed based on the "payment" selection.

   Payment sections for "PayPal," and "Bitcoin" are hidden until they're needed.

   If user chooses "PayPal" or "Bitcoin", then hide "Credit Card" and reveal the chosen section.

   ----------------------------------------------------------------------------- */

  $("#paypal").addClass("is-hidden");
  $("#bitcoin").addClass("is-hidden");

  $payment.change(function () {

    var paymentType = $(this).val();
    console.log(paymentType);
    if (paymentType === "credit card") {
      $("#credit-card").removeClass();
      //$("#cc-num").focus();
      $("#bitcoin").addClass("is-hidden");
      $("#paypal").addClass("is-hidden");
    } else if (paymentType === "paypal") {
      $("#credit-card").addClass("is-hidden");
      $("#bitcoin").addClass("is-hidden");
      $("#paypal").removeClass();
      $("#demo-message").remove();
    } else if (paymentType === "bitcoin") {
      $("#credit-card").addClass("class", "is-hidden");
      $("#bitcoin").removeClass();
      $("#paypal").addClass("is-hidden");
      $("#demo-message").remove();
    }
  });

  /* --------------------------------------------------------------------------

   Form Validation on Submit

   Check the form for missing or invalid data.

   Display a summary of errors at the top of the page if any errors are present

   ----------------------------------------------------------------------------- */

  $("#registration-form").submit(function () {

    var $errorSummary = $("#error-summary");

    // clear all errors
    errors = [];
    $errorSummary.remove();

    // start validation checks
    if (!nameIsValid()) {
      errors.push("Enter a name.");
      nameError = true;
    }
    if (!emailIsValid()) {
      errors.push("Enter a valid email.");
      emailError = true;
    }
    if (activities.length <= 0) {
      errors.push("Select at least one activity.");
      activityError = true;
    }
    if ($payment.val() === "select_method") {
      errors.push("Select a payment method.");
      paymentError = true;
    }
    if ($payment.val() === "credit card") {

      if (!creditCardIsValid()) {
        errors.push("Enter a credit card number.");
        creditCardError = true;
      }
      if (!(zipIsValid())) {
        errors.push("Enter a 5 digit zip code.");
        zipError = true;
      }
      if (!(cvvIsValid())) {
        errors.push("Enter a 3 digit cvv.");
        cvvError = true;
      }
    }

    if (errors.length > 0) {
      var $errorDiv = "<div id='error-summary'><h5>Please correct the following error(s)</h5></div>";
      var $form = $("#registration-form");
      $form.prepend($errorDiv);
      $("h5").append($("<ul id='error-list'></ul>"));

      for (var i=0; i < errors.length; i++) {
        $("#error-list").append($("<li>" + errors[i] + "</li>"));
      }

      // scroll to the top of the page to display the errors
      scroll(0,0);
      return false;
    }
    else {
      // clean up errors
      errors = [];
      $errorSummary.remove();

      console.log("submit success");
      alert("Successfully registered!");
      return true;
    }
  });

  /* --------------------------------------------------------------------------

   Individual validation checks for form fields.

   ----------------------------------------------------------------------------- */
  // Check that the name is valid (must be at least 1 character)
  function nameIsValid() {
    var nameValue = $name.val();
    return (nameValue.length > 0  && !$.isNumeric(nameValue)) ;
  }

  // Check that email is valid
  function emailIsValid() {

    var myPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
    var emailValue = $mail.val();

    var isValid = emailValue.search(myPattern) >= 0;
    return (isValid);
  }

  // Basic check to see that the credit card number field is filled out. This does not check if the number is valid.
  function creditCardIsValid() {
    return ($("#cc-num").val() > 0);
  }

  function zipIsValid() {
    var zipcode = $('#zip').val();
    return ($.isNumeric(zipcode) && zipcode.length === 5);
  }

  function cvvIsValid() {
    var cvv = $("#cvv").val();
    return ( $.isNumeric(cvv) && cvv.length === 3);
  }

})();
