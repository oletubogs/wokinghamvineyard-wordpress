<?php
/**
 * The template for displaying the header
 *
 * Displays all of the head element and everything up until the "site-content" div.
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */

require_once('admin/functions.php');
$templateUrl = esc_url( get_template_directory_uri() );
$pageSlug = str_replace(get_site_url(), '', get_permalink());

?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="initial-scale=1.0, maximum-scale=2.0">
  <meta name="creator" content="Nick Price">
  <meta name="publisher" content="Wokingham Vineyard">
  <title><?php
  echo bloginfo('name');
  if ( is_single() ) {
    $pageTitle = get_post_type_object( get_post_type() )->labels->name;
    $pageTitle .= ' - ' . get_the_title();
  } else {
    $pageTitle = get_the_title();
  }
  echo (!empty($pageTitle)) ? ' - ' . $pageTitle : null;
  ?></title>
  <link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
  <!--[if gt IE 8]><!--><link rel="stylesheet" href="<?php echo $templateUrl; ?>/static/css/index.css"><!--<![endif]-->
  <!--[if lte IE 8]><link rel="stylesheet" href="<?php echo $templateUrl; ?>/static/css/index-ie8.css"><![endif]-->
  <script src="<?php echo $templateUrl; ?>/static/js/lib/vendor/Modernizr.js"></script>
  <!--[if lte IE 8]><script src="<?php echo $templateUrl; ?>/static/js/lib/vendor/html5shiv.js"></script><![endif]-->
  <link rel="shortcut icon" href="<?php echo $templateUrl; ?>/static/images/meta/favicon.ico">

  <?php wp_head(); ?>
</head>

<body>
<header role="banner" class="main-header js-main-header">
  <div class="centering">
    <a href="/" class="main-header__logo">Wokingham Vineyard</a>

    <nav role="navigation" aria-label="Primary Navigation" class="main-nav js-main-nav">
      <button class="btn btn--clear main-nav__mobile-toggle js-mobile-nav-toggle">
        <i class="icon icon--menu"></i>
      </button>

      <ul class="main-nav__items js-nav-items">
        <li class="main-nav__item main-nav__item--newcomers <?=(strpos($pageSlug, '/newcomers/') !== false) ? 'main-nav__item--active' : null; ?>"><a href="/newcomers/" class="main-nav__item__link">I'm New!</a></li>
        <li class="main-nav__item main-nav__item--sundays <?=(strpos($pageSlug, '/about/sundays/') !== false) ? 'main-nav__item--active' : null; ?>"><a href="/about/sundays/" class="main-nav__item__link">Sundays</a></li>
        <li data-dropdown-target="about" class="main-nav__item main-nav__item--about <?=(strpos($pageSlug, '/about/') !== false && strpos($pageSlug, '/about/sundays/') === false) ? 'main-nav__item--active' : null; ?>"><div class="main-nav__item__link">About</div></li>
        <li data-dropdown-target="connected" class="main-nav__item main-nav__item--connected <?=(strpos($pageSlug, '/get-connected/') !== false || strpos($pageSlug, '/connect-groups/') !== false ||  strpos($pageSlug, '/ministries/') !== false || strpos($pageSlug, '/contact-us/') !== false) ? 'main-nav__item--active' : null; ?>"><div class="main-nav__item__link">Get Connected</div></li>
        <li class="main-nav__item main-nav__item--giving <?=(strpos($pageSlug, '/giving/') !== false) ? 'main-nav__item--active' : null; ?>"><a href="/giving/" class="main-nav__item__link">Giving</a></li>
        <li class="main-nav__item--search"><div class="main-nav__search__toggle" data-dropdown-target="search"><i class="icon icon--search"></i><i class="icon icon--cross"></i><span>Search</span></div><form action="/search/" id="searchform" method="get" class="main-nav__search"><input type="text" name="query" placeholder="Enter search query" class="control control--text main-nav__search__input" value="<?php the_search_query(); ?>"><button type="submit" id="searchsubmit" value="Search" class="btn btn--clear main-nav__search__submit"><i class="icon icon--search"></i></button></form></li>
      </ul>
    </nav>
  </div>
</header>

<form action="/search/" id="searchform" method="get" data-dropdown="search" class="main-header__dropdown main-header__search hidden--mobile">
  <div class="centering">
    <input type="text" name="query" value="<?php the_search_query(); ?>" placeholder="Enter search query" class="control control--text main-header__search__input">
    <button type="submit" id="searchsubmit" value="Search" class="btn btn--clear main-header__search__submit">
      <i class="icon icon--search"></i>
    </button>
  </div>
</form>

<div data-dropdown="about" class="main-header__dropdown">
  <div class="centering">
    <div class="main-nav__dropdown__items">
      <div class="grid"><div class="grid__item tablet-one-fifth"><div class="main-nav__dropdown__item <?=(strpos($pageSlug, '/about/meet-the-team/') !== false) ? 'main-nav__dropdown__item--active' : null; ?>"><a href="/about/meet-the-team/">Meet the Team</a></div></div><div class="grid__item tablet-one-fifth"><div class="main-nav__dropdown__item <?=(strpos($pageSlug, '/about/our-vision/') !== false) ? 'main-nav__dropdown__item--active' : null; ?>"><a href="/about/our-vision/">Our Vision</a></div></div><div class="grid__item tablet-one-fifth"><div class="main-nav__dropdown__item <?=(strpos($pageSlug, '/about/our-history/') !== false) ? 'main-nav__dropdown__item--active' : null; ?>"><a href="/about/our-history/">Our History</a></div></div><div class="grid__item tablet-one-fifth"><div class="main-nav__dropdown__item <?=(strpos($pageSlug, '/about/baptisms/') !== false) ? 'main-nav__dropdown__item--active' : null; ?>"><a href="/about/baptisms/">Baptisms</a></div></div><div class="grid__item tablet-one-fifth"><div class="main-nav__dropdown__item <?=(strpos($pageSlug, '/about/vineyard-centre/') !== false) ? 'main-nav__dropdown__item--active' : null; ?>"><a href="/about/vineyard-centre/">Vineyard Centre</a></div></div></div>
    </div>
  </div>
</div>

<div data-dropdown="connected" class="main-header__dropdown">
  <div class="centering">
    <div class="main-nav__dropdown__items">
      <div class="grid"><div class="grid__item tablet-one-quarter"><div class="main-nav__dropdown__item <?=(strpos($pageSlug, '/connect-groups/') !== false) ? 'main-nav__dropdown__item--active' : null; ?>"><a href="/get-connected/connect-groups/">Connect Groups</a></div></div><div class="grid__item tablet-one-quarter"><div class="main-nav__dropdown__item <?=(strpos($pageSlug, '/ministries/') !== false) ? 'main-nav__dropdown__item--active' : null; ?>"><a href="/ministries/">Ministries</a></div></div><div class="grid__item tablet-one-quarter"><div class="main-nav__dropdown__item <?=(strpos($pageSlug, '/contact-us/') !== false) ? 'main-nav__dropdown__item--active' : null; ?>"><a href="/contact-us/">Contact Us</a></div></div></div>
    </div>
  </div>
</div>
