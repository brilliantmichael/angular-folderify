define([
  'lodash',
  'alertify',
  'angular',
  'aws-sdk'
], function(
  _,
  alertify,
  angular,
  AWS
) {

  var $inButton = angular.element(document.getElementById('signinButton'));
  var $outButton = angular.element(document.getElementById('signoutButton'));

  var $profileImage = angular.element(document.getElementById('signedinProfileImage'));
  var $outEmail = angular.element(document.getElementById('signedinEmail'));

  var $signinLine = angular.element(document.getElementById('signinLine'));
  var $signoutLine = angular.element(document.getElementById('signoutLine'));

  var showInButton = function() {

    $signoutLine.removeClass('in');
    $profileImage.removeClass('in');
    $profileImage.addClass('out');

    setTimeout(function() {

      $signoutLine.addClass('hide out');
      $signinLine.removeClass('hide out');
      $signinLine.addClass('in');

      $profileImage.addClass('hide');
      $profileImage.removeAttr('src');

    }, 1000);
  };
  var showOutButton = function(showVars) {

    $signinLine.removeClass('in');
    $profileImage.removeClass('hide out');
    $profileImage.attr('src', showVars.image);

    if (showVars.email) {
      $outEmail.html(showVars.email);
    }

    setTimeout(function() {

      $signinLine.addClass('hide out');
      $signoutLine.removeClass('hide out');
      $signoutLine.addClass('in');

      $profileImage.addClass('in');

    }, 1000);
  };

  var signInToGoogle = function() {


    // Google+ SignIn Button
    // ---------------------
    // https://developers.google.com/+/web/signin/javascript-flow

    // http://docs.aws.amazon.com/STS/latest/UsingSTS/web-identity-federation.html

    // https://aws.amazon.com/blogs/aws/aws-iam-now-supports-amazon-facebook-and-google-identity-federation/
    // http://docs.aws.amazon.com/STS/latest/UsingSTS/web-identity-federation.html

    // http://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html
    // http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/browser-configuring-wif.html
    // https://developers.google.com/+/web/signin/server-side-flow


    // This should only be called once - stacks if triggered multiple times
    gapi.auth.signIn({

      // https://developers.google.com/+/web/signin/session-state
      //
      // "The function that you define for your sign-in callback will be called
      // every time that the user's signed in status changes if you define your
      // sign-in callback as a page-level configuration parameter."
      //
      // @ar object 'authResult'
      callback: function signinCallback(ar) {

        // AWS stuff
        // ---------
        //var s3;
        //var AWS_ACCOUNT_ID = '887673865437';
        // @TODO request Don to create user for generic connections team members that can't delete S3 objects
        //var WEB_IDENTITY_ROLE_NAME = 'misidro';

        // Monitoring the user's session state
        // -----------------------------------
        // https://developers.google.com/+/web/signin/session-state
        if (!ar.status.signed_in) {

          if (ar.status.google_logged_in) {

            alertify.alert("It seems you're signed in to Google but not this app. Please click the login button to do so.");

          } else {
            // There was an error. Update the app to reflect a signed out user.
            // Possible error codes:
            //   "access_denied" - User denied access to your app
            //   "immediate_failed" - Could not automatially log in the user
            alertify.alert("You don't seem to be logged in. Try examining the following for the reasons, then click the login button: <pre>" + JSON.stringify(ar, null, ' ') + "</pre>");

          }

          showInButton();
        } else {

          /*
            // Use AWS SDK to register Google token with Amazon STS
            // http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/browser-configuring-wif.html
            // https://web-identity-federation-playground.s3.amazonaws.com/index.html
            AWS.config.credentials = new AWS.WebIdentityCredentials({
              RoleArn: 'arn:aws:iam::' + AWS_ACCOUNT_ID + ':role/' + WEB_IDENTITY_ROLE_NAME,
              // ProviderId: 'graph.facebook.com|www.amazon.com', // Omit this for Google
              WebIdentityToken: ar['id_token']
            });

            s3 = new AWS.S3();

            alertify.alert('You are now logged in to S3.');
            console.log('ar', ar);
            console.log('s3', s3);
          */

          // Get the user's email
          // https://developers.google.com/+/web/people/
          gapi.client.load('plus', 'v1', function apiClientLoaded() {

            gapi.client.plus.people
              .get({
                userId: 'me'
              })
              .execute(function handleEmailResponse(resp) {

                var emailObj = _.find(resp.emails, function(obj) {
                  return obj.type === 'account';
                });
                var showVars = {
                  firstname: resp.name.givenName,
                  lastname: resp.name.familyName,
                  image: resp.image.url,
                  email: emailObj ? emailObj.value : null
                };

                alertify.alert("Thanks, you've logged in using Google+, so now you can use the 'id_token':\n\n<pre>[" + ar.id_token + "]</pre>\n\nto access Amazon STS. Click the button again to log out.");
                showOutButton(showVars);
              });

          });
        }

      }

    });
  };


  $outButton.on('click', function() {
    gapi.auth.signOut();
  });

  $inButton.on('click', signInToGoogle);

});
