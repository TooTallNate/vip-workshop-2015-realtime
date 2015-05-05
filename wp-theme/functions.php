<?php
// Init WP.com VIP environment
require_once( WP_CONTENT_DIR . '/themes/vip/plugins/vip-init.php' );

/**
 * Enqueue parent theme's CSS alongside child theme's
 */
function tootallnate_assets() {
	wp_dequeue_style( 'twentyfifteen-style' );
	wp_enqueue_style( 'twentyfifteen-style', get_template_directory_uri() . '/style.css' );
	wp_enqueue_style( 'tootallnate', get_stylesheet_uri(), array( 'twentyfifteen-style' ), 20150428, 'all' );
}
add_action( 'wp_enqueue_scripts', 'tootallnate_assets' );
