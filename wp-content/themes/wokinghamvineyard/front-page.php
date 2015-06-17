<?php
/**
 * Page template for:
 * http://wokinghamvineyard.org/
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */

get_header();

// SOCIAL MEDIA
require_once('inc/TwitterAPIExchange.php');
require_once('inc/InstagramAPIExchange.php');



// INSTAGRAM
$instagram = new InstagramAPIExchange('c9ebbe47a14744bb8ee523118ec6e2a6');
$recentInstagram = $instagram->getUserMedia('1802518863', 1);
$recentInstagramImageUrl = $recentInstagram->data[0]->images->standard_resolution->url;
$recentInstagramUrl = $recentInstagram->data[0]->link;

// TWITTER
$twitterSettings = array(
  'oauth_access_token' => "546353098-mFrt138upIekX8gDaasTuF0fUVi77xT6dxlwMhVz",
  'oauth_access_token_secret' => "4aiYtzDbbq59CDkO7gQwV0sSA8UyxMdq748Sf8cvIgGFw",
  'consumer_key' => "O89w8V04p2duDvPos6S039iCt",
  'consumer_secret' => "VGwDVpv7wgVzwa8cZlltXp6S8yeRX6bxugCjyPmpRD7lmGO7dC"
);

$twUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
$twGetfield = '?screen_name=wokinghamvc&count=2';
$twRequestMethod = 'GET';

$twitter = new TwitterAPIExchange($twitterSettings);
$response = $twitter->setGetfield($twGetfield)
  ->buildOauth($twUrl, $twRequestMethod)
  ->performRequest();

$recentTweets = json_decode($response, true);


?>
<main role="main" class="main-content"><div class="content-grid"><div class="centering"><div class="grid grid--gutterless"><div class="grid__item desktop-two-fifths"><a href="/wordpress/newcomers/" class="content-grid__item content-grid__item--tall content-grid__item--light content-grid__item--newcomer"><div class="content-grid__item__background"></div><div class="content-grid__item__content"><div class="content-grid__item__title">I'm new <br>around here!</div><hr><div class="content-grid__item__subtitle">Look no further - we'd love to introduce ourselves!</div></div></a></div><div class="grid__item desktop-three-fifths"><div class="grid grid--gutterless"><div class="grid__item desktop-two-thirds"><a href="/wordpress/ministries/" class="content-grid__item content-grid__item--primary content-grid__item--our-ministries"><div class="content-grid__item__background"></div><div class="content-grid__item__content"><div class="content-grid__item__title">Our <br>Ministries</div><hr><div class="content-grid__item__subtitle">Learn about our ministries.</div></div></a></div><div class="grid__item tablet-one-half desktop-one-third hidden--mobile"><a href="<?php echo $recentInstagramUrl; ?>" target="new" class="content-grid__item content-grid__item--primary content-grid__item--social content-grid__item--social--wide"><div class="content-grid__item__content"><div class="content-grid__item__media"><div style="background-image:url(<?php echo $recentInstagramImageUrl; ?>)" class="content-grid__item__media__image"></div><div class="content-grid__item__media__social"><i class="icon icon--instagram"></i><span>@wokinghamvc</span></div></div></div></a></div><div class="grid__item tablet-one-half desktop-one-third hidden--mobile"><a href="https://twitter.com/wokinghamvc/statuses/<?php echo $recentTweets[0]['id_str']; ?>" target="new" class="content-grid__item content-grid__item--primary content-grid__item--social"><div class="content-grid__item__content"><div class="content-grid__item__media"><div class="content-grid__item__media__social"><i class="icon icon--twitter"></i><span>@wokinghamvc</span></div><p class="content-grid__item__media__text"><?php echo $recentTweets[0]['text']; ?></p><div class="content-grid__item__media__author">@<?php echo $recentTweets[0]['user']['screen_name']; ?></div></div></div></a></div><div class="grid__item desktop-two-thirds"><a href="/wordpress/get-connected/connect-groups/" class="content-grid__item content-grid__item--light content-grid__item--get-connected"><div class="content-grid__item__background"></div><div class="content-grid__item__content"><div class="content-grid__item__title">During <br>the week</div><hr><div class="content-grid__item__subtitle">How can I get connected?</div></div></a></div></div></div></div><div class="grid grid--gutterless"><div class="grid__item desktop-two-fifths"><a href="/wordpress/about/our-vision/" class="content-grid__item content-grid__item--small content-grid__item--primary content-grid__item--vision"><div class="content-grid__item__background"></div><div class="content-grid__item__content"><div class="content-grid__item__title">Going <br>Deeper</div><hr><div class="content-grid__item__subtitle">Our vision for 2015.</div></div></a></div><div class="grid__item desktop-two-fifths"><a href="/wordpress/about/meet-the-team/" class="content-grid__item content-grid__item--light content-grid__item--our-teams"><div class="content-grid__item__background"></div><div class="content-grid__item__content"><div class="content-grid__item__title">Our <br>Teams</div><hr><div class="content-grid__item__subtitle">Who's behind the scenes?</div></div></a></div><div class="grid__item desktop-one-fifth"><a href="/wordpress/contact-us/" class="content-grid__item content-grid__item--small content-grid__item--primary content-grid__item--get-in-touch"><div class="content-grid__item__background"></div><div class="content-grid__item__content"><div class="content-grid__item__title">Get <br>in touch</div></div></a></div></div></div></div></main>

<?php get_footer(); ?>
