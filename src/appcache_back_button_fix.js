/**
 * Since the back button does not work in current iOS 7.1.1 while in app mode, it is
 * necessary to manually assign the back button urls.
 *
 * Set up the URL replacements so that the id of the page is matched with the new URL
 * of the back buttons it contains. The use of wild cards is possible eg.

 backButtonUrls = {
  'app-*':'home',
  'app-examples':'home',
  'tab-location':'home' 
};
 */

/**
 * Fixes back buttons for specific page
 */
function fixPageBackButtons(currentPageURL, nextPageId) {
  console.log('FIXING: back buttons ( ' + nextPageId + ')');

  var buttons = jQuery("div[id='" + nextPageId + "'] a[data-rel='back']");
  buttons.each(function (index, button) {
    jQuery(button).removeAttr('data-rel');

    //skip external pages
    if (currentPageURL != null) {
      //assign new url to the button
      jQuery(button).attr('href', currentPageURL);
    }
  });
}

/**
 * Generic function to detect the browser
 * 
 * Chrome has to have and ID of both Chrome and Safari therefore
 * Safari has to have an ID of only Safari and not Chrome
 */
function browserDetect(browser) {
  if (browser == 'Chrome' || browser == 'Safari') {
    var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
    var is_safari = navigator.userAgent.indexOf("Safari") > -1;
    var is_mobile = navigator.userAgent.indexOf("Mobile") > -1;

    if (is_safari) {
      if (browser == 'Chrome') {
        //Chrome
        return (is_chrome) ? true : false;
      } else {
        //Safari
        return (!is_chrome) ? true : false;
      }
    } else if (is_mobile) {
      //Safari homescreen Agent has only 'Mobile'
      return true;
    }
    return false;
  }
  return (navigator.userAgent.indexOf(browser) > -1);
}