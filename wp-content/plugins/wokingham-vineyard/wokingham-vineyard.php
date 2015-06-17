<?php
/**
 * Plugin Name: Wokingham Vineyard
 * Description: Adds extra information, content and widgets to wokinghamvineyard.org.
 * Version: 1.0.0
 * Author: Nick Price
 * Author URI: http://wokinghamvineyard.org
 * License: Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)
 * License URI: http://creativecommons.org/licenses/by-nc-nd/4.0/
 * Text Domain: wokinghamvineyard
 */



/**
 * Deactivate Wordpress Widgets
 * @since Wokingham Vineyard 1.0
 *
 */
function unregister_default_widgets() {
  unregister_widget('WP_Widget_Pages');
  unregister_widget('WP_Widget_Calendar');
  unregister_widget('WP_Widget_Archives');
  unregister_widget('WP_Widget_Links');
  unregister_widget('WP_Widget_Meta');
  unregister_widget('WP_Widget_Search');
  unregister_widget('WP_Widget_Text');
  unregister_widget('WP_Widget_Categories');
  unregister_widget('WP_Widget_Recent_Posts');
  unregister_widget('WP_Widget_Recent_Comments');
  unregister_widget('WP_Widget_RSS');
  unregister_widget('WP_Widget_Tag_Cloud');
  unregister_widget('WP_Nav_Menu_Widget');
}
add_action('widgets_init', 'unregister_default_widgets', 11);




/**
 * Register widget areas.
 *
 * @since Wokingham Vineyard 1.0
 *
 * @link https://codex.wordpress.org/Function_Reference/register_sidebar
 */
function wv_widgets_init() {
  register_sidebar( array(
    'name'          => __( 'Sundays Widgets' ),
    'id'            => 'widgets-sundays',
    'description'   => __( 'Add widgets here to appear on the Sundays page.' ),
    'before_widget' => '<div class="widget">',
    'after_widget'  => '</div>',
    'before_title'  => '<h2 class="widget__title">',
    'after_title'   => '</h2>',
  ) );
}
add_action( 'widgets_init', 'wv_widgets_init' );




/**
 * Widget: Information Box
 * @since Wokingham Vineyard 1.0
 *
 */
require plugin_dir_path( __FILE__ ) . 'widgets/information-box.php';




/**
 * Add properties page
 * @since Wokingham Vineyard 1.0
 *
 */
require plugin_dir_path( __FILE__ ) . 'wv-properties.php';
