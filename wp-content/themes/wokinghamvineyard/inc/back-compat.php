<?php
/**
 * Wokingham Vineyard back compat functionality
 *
 * Prevents Wokingham Vineyard from running on WordPress versions prior to 4.1,
 * since this theme is not meant to be backward compatible beyond that and
 * relies on many newer functions and markup changes introduced in 4.1.
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */

/**
 * Prevent switching to Wokingham Vineyard on old versions of WordPress.
 *
 * Switches to the default theme.
 *
 * @since Wokingham Vineyard 1.0
 */
function wv_switch_theme() {
	switch_theme( WP_DEFAULT_THEME, WP_DEFAULT_THEME );
	unset( $_GET['activated'] );
	add_action( 'admin_notices', 'wv_upgrade_notice' );
}
add_action( 'after_switch_theme', 'wv_switch_theme' );

/**
 * Add message for unsuccessful theme switch.
 *
 * Prints an update nag after an unsuccessful attempt to switch to
 * Wokingham Vineyard on WordPress versions prior to 4.1.
 *
 * @since Wokingham Vineyard 1.0
 */
function wv_upgrade_notice() {
	$message = sprintf( __( 'Wokingham Vineyard requires at least WordPress version 4.1. You are running version %s. Please upgrade and try again.', 'wv' ), $GLOBALS['wp_version'] );
	printf( '<div class="error"><p>%s</p></div>', $message );
}

/**
 * Prevent the Customizer from being loaded on WordPress versions prior to 4.1.
 *
 * @since Wokingham Vineyard 1.0
 */
function wv_customize() {
	wp_die( sprintf( __( 'Wokingham Vineyard requires at least WordPress version 4.1. You are running version %s. Please upgrade and try again.', 'wv' ), $GLOBALS['wp_version'] ), '', array(
		'back_link' => true,
	) );
}
add_action( 'load-customize.php', 'wv_customize' );

/**
 * Prevent the Theme Preview from being loaded on WordPress versions prior to 4.1.
 *
 * @since Wokingham Vineyard 1.0
 */
function wv_preview() {
	if ( isset( $_GET['preview'] ) ) {
		wp_die( sprintf( __( 'Wokingham Vineyard requires at least WordPress version 4.1. You are running version %s. Please upgrade and try again.', 'wv' ), $GLOBALS['wp_version'] ) );
	}
}
add_action( 'template_redirect', 'wv_preview' );
