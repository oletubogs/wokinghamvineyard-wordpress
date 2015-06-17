<?php
/**
 * Wokingham Vineyard Admin Customisation
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */




/**
 * Set up custom columns (Teams)
 * @since Wokingham Vineyard 1.0
 *
 */
function set_columns__teams( $columns ) {
  return array(
    'cb' => '<input type="checkbox" />',
    'title' => __('Title'),
    'team_leader' => __('Leaders'),
    'featured_team' => __('Displayed on Sundays Page?'),
  );
}
add_filter( 'manage_teams_posts_columns' , 'set_columns__teams' );




/**
 * Register sortable columns (Teams)
 * @since Wokingham Vineyard 1.0
 *
 */
function set_sortable_columns__teams() {
  return array(
    'title' => 'title',
  );
}
add_filter( 'manage_edit-teams_sortable_columns', 'set_sortable_columns__teams' );




/**
 * Add content to custom columns (Teams)
 * @since Wokingham Vineyard 1.0
 *
 */
function set_column_content__teams( $column, $post_id ) {
  global $post;

  switch( $column ) {

    // Connect Group Leaders
    case 'featured_team' :
      $isFeaturedTeam = get_post_meta( $post_id, 'featured_team', true );

      if ( empty( $isFeaturedTeam ) )
        echo __( 'No' );
      else
        echo __( 'Yes' );
      break;

    // Connect Group Leaders
    case 'team_leader' :
      $leaderIds = get_post_meta( $post_id, 'team_leader', true );

      if (empty($leaderIds)) {
        echo __( 'Not set' );
        break;
      }

      $leaderNames = getLeadersListFromIds($leaderIds);

      if ( empty( $leaderNames ) )
        echo __( 'Not set' );
      else
        echo $leaderNames;
      break;

    default :
      break;
  }
}
add_action( 'manage_teams_posts_custom_column', 'set_column_content__teams', 10, 2 );
