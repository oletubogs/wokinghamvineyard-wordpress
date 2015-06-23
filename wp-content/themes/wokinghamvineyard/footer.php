<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the "site-content" div and all content after.
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */

$templateUrl = esc_url( get_template_directory_uri() );

?>

<footer role="contentinfo" class="main-footer">
  <div class="centering">
    <div class="main-footer__navs"><div class="grid"><div class="grid__item desktop-two-fifths"><div class="main-footer__contact"><div class="main-footer__title">Get in Contact</div><a href="#" class="main-footer__contact__item js-contact-email"><i class="icon icon--envelop"></i><span class="js-contact-email-text">email us</span></a><a href="#" class="main-footer__contact__item js-contact-phone"><i class="icon icon--phone"></i><span class="js-contact-phone-text">call us</span></a><script>// Insert email address
var e = new Array('org','eyard.','hamvin','hello@','woking')
  , em = e[3]+e[4]+e[2]+e[1]+e[0]
document.getElementsByClassName('js-contact-email-text')[0].innerText = em
document.getElementsByClassName('js-contact-email')[0].href = 'mailto:' + em
// Insert phone number
var t = new Array('87','800','013','44 7')
  , tm = t[2]+t[3]+t[1]+t[0]
document.getElementsByClassName('js-contact-phone-text')[0].innerText = tm
document.getElementsByClassName('js-contact-phone')[0].href = 'tel:' + tm
</script></div><div class="main-footer__social"><a target="new" href="http://www.twitter.com/wokinghamvc" class="main-footer__social__item"><i class="icon icon--twitter"></i></a><a target="new" href="http://www.facebook.com/wokinghamvc" class="main-footer__social__item"><i class="icon icon--facebook"></i></a><a target="new" href="http://www.instagram.com/wokinghamvc" class="main-footer__social__item"><i class="icon icon--instagram"></i></a></div></div><div class="grid__item tablet-one-half desktop-one-fifth"><div class="grid"><div class="grid__item mobile-one-half desktop-one-whole"><ul class="main-footer__nav main-footer__nav--quick-links"><li class="main-footer__title">Quick Links</li><li class="main-footer__nav__item"><a href="/">Home</a></li><li class="main-footer__nav__item"><a href="/newcomers/">I'm new!</a></li><li class="main-footer__nav__item"><a href="/giving/">Giving</a></li></ul></div><div class="grid__item mobile-one-half desktop-one-whole"><ul class="main-footer__nav"><li class="main-footer__title">Get Connected</li><li class="main-footer__nav__item"><a href="/get-connected/connect-groups/">Connect Groups</a></li><li class="main-footer__nav__item"><a href="/contact-us/">Contact Us</a></li></ul></div></div></div><div class="grid__item tablet-one-half desktop-two-fifths"><div class="grid"><div class="grid__item mobile-one-half"><ul class="main-footer__nav"><li class="main-footer__title">About</li><li class="main-footer__nav__item"><a href="/about/sundays/">Sundays</a></li><li class="main-footer__nav__item"><a href="/about/meet-the-team/">Meet the Team</a></li><li class="main-footer__nav__item"><a href="/about/our-vision/">Our Vision</a></li><li class="main-footer__nav__item"><a href="/about/our-history/">Our History</a></li><li class="main-footer__nav__item"><a href="/about/baptisms/">Baptisms</a></li><li class="main-footer__nav__item"><a href="/about/vineyard-centre/">Vineyard Centre</a></li></ul></div><div class="grid__item mobile-one-half"><ul class="main-footer__nav"><li class="main-footer__title"><a href="/ministries">Our Ministries</a></li><li class="main-footer__nav__item"><a href="/ministries/youth/">Youth</a></li><li class="main-footer__nav__item"><a href="/ministries/students-and-20s/">Students &amp; 20s</a></li><li class="main-footer__nav__item"><a href="/ministries/families/">Families</a></li><li class="main-footer__nav__item"><a href="/ministries/seniors/">Seniors</a></li><li class="main-footer__nav__item"><a href="/ministries/growbaby/">Growbaby</a></li><li class="main-footer__nav__item"><a href="http://crowthorne.foodbank.org.uk/" target="new">Foodbank</a></li><li class="main-footer__nav__item"><a href="http://zoezambia.org/" target="new">Zoe Zambia</a></li></ul></div></div></div></div></div></div>
<div class="main-footer__copyright">
  <div class="centering">
    <div class="main-footer__copyright__content">
      <div class="main-footer__logo"></div>
      <p class="main-footer__copyright__info">Wokingham Vineyard Christian Fellowship is a registered charity in England and Wales (no. 1106781), whose registered office is located at the following address: Vineyard Church Centre, 25 Wellington Business Park, Crowthorne, Berkshire, RG45 6LS.</p>
      <p class="main-footer__copyright__info">All contents &copy; Wokingham Vineyard <?php echo date('Y'); ?></p>
    </div>
  </div>
</div></footer><script src="<?php echo $templateUrl; ?>/static/js/lib/fonts.js"></script><script src="<?php echo $templateUrl; ?>/static/js/lib/vendor/jquery-1.11.2.min.js"></script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBzHjhHx7F1JJ1ZtoYOewEACuGvLLxVF9Q"></script><script src="<?php echo $templateUrl; ?>/static/js/build/index.js"></script>

<?php wp_footer(); ?>

</body></html>
