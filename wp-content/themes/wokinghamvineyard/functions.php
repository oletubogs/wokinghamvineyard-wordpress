<?php
/**
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */





/**
 * Theme setup
 *
 * @since Wokingham Vineyard 1.0
 */
function wv_setup() {

	// Enable support for Post Thumbnails on posts and pages.
	add_theme_support( 'post-thumbnails' );
	set_post_thumbnail_size( 400, 400, array('center', 'center') );
	add_image_size( 'landscape', 650, 350, true );
	add_image_size( 'ministry-grid', 512, 326, true );

	// This theme uses wp_nav_menu() in two locations.
	register_nav_menus( array(
		'header' => __( 'Header Menu', 'wv' ),
		'footer' => __( 'Footer Menu', 'wv' ),
		'social'  => __( 'Social Links Menu', 'wv' ),
	) );

	// Switch markup to HTML5.
	add_theme_support( 'html5', array(
		'search-form', 'gallery', 'caption'
	) );
}
add_action( 'after_setup_theme', 'wv_setup' );





/**
 * Filter posts by title's starting letter.
 *
 * @since Wokingham Vineyard 1.0
 */
add_filter( 'posts_where', 'title_starting_letter', 10, 2 );
function title_starting_letter( $where, &$wp_query )
{
    global $wpdb;
    if ( $title_starting_letter = $wp_query->get( 'title_starting_letter' ) ) {
        $where .= ' AND ' . $wpdb->posts . '.post_title LIKE \'' . esc_sql( $wpdb->esc_like( $title_starting_letter ) ) . '%\'';
    }
    return $where;
}





/**
 * Customise Admin.
 *
 * @since Wokingham Vineyard 1.0
 */
require get_template_directory() . '/admin/index.php';



/**
 * Search Request Manipulation.
 *
 * @since Wokingham Vineyard 1.0
 */
function my_posts_where( $where ) {
	$where = str_replace("meta_key = 'page_content_%_content_block_%_content_block__text'", "meta_key LIKE 'page_content_%_content_block_%_content_block__text'", $where);
	$where = str_replace("meta_key = 'page_content_%_content_block_%_content_block__title'", "meta_key LIKE 'page_content_%_content_block_%_content_block__title'", $where);
	return $where;
}
add_filter('posts_where', 'my_posts_where');



/**
 * Customise Login Page.
 *
 * @since Wokingham Vineyard 1.0
 */
function login_page__logo() { ?>
  <style type="text/css">
    .login h1 a {
      background-image: url(<?php echo get_stylesheet_directory_uri(); ?>/static/images/site-login-logo.png);
      padding-bottom: 30px;
      width: 100px;
      height: 100px;
      background-size: 100px;
    }
  </style>
<?php }
add_action( 'login_enqueue_scripts', 'login_page__logo' );
