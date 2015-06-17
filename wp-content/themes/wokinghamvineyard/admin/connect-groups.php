<?php
/**
 * Wokingham Vineyard Admin Customisation
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */




/**
 * Set up custom columns (Connect Group)
 * @since Wokingham Vineyard 1.0
 *
 */
function set_columns__connect_group( $columns ) {
  return array(
    'cb' => '<input type="checkbox" />',
    'title' => __('Title'),
    'leaders' => __('Leaders'),
    'day_of_week' => __('Day'),
    'meeting_time' => __('Time'),
    'occurence' => __('Occurence'),
    'type-of-group' => __('Type'),
  );
}
add_filter( 'manage_connect-group_posts_columns' , 'set_columns__connect_group' );




/**
 * Register sortable columns (Connect Group)
 * @since Wokingham Vineyard 1.0
 *
 */
function set_sortable_columns__connect_group() {
  return array(
    'title' => 'title',
    'day_of_week' => 'day_of_week',
  );
}
add_filter( 'manage_edit-connect-group_sortable_columns', 'set_sortable_columns__connect_group' );




/**
 * Filter sortable columns (Connect Group)
 * @since Wokingham Vineyard 1.0
 *
 */
function set_sortable_orderby__connect_group( $req ) {

  switch ( $req['orderby'] ) {
    case 'day_of_week' :
      $req = array_merge( $req, array(
        'meta_key' => 'meeting_day',
        'orderby' => 'meta_value_num'
      ) );
      break;

    default :
      break;
  }
  return $req;
}
add_filter( 'request', 'set_sortable_orderby__connect_group' );




/**
 * Add content to custom columns (Connect Group)
 * @since Wokingham Vineyard 1.0
 *
 */
function set_column_content__connect_group( $column, $post_id ) {
  global $post;

  switch( $column ) {

    // Meeting day
    case 'day_of_week' :
      $weekdays = array('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
      $weekday = get_post_meta( $post_id, 'meeting_day', true );
      if ( empty( $weekday ) )
        echo __( 'Not set' );
      else
        echo $weekdays[$weekday - 1];
      break;

    // Connect Group Occurence
    case 'occurence' :
      $occurence = get_post_meta( $post_id, 'occurence' );
      if ( empty( $occurence ) )
        echo __( 'Not set' );
      else
        echo $occurence[0];
      break;

    // Connect Group Time
    case 'meeting_time' :
      $meeting_time = get_post_meta( $post_id, 'meeting_time' );
      if ( empty( $meeting_time ) )
        echo __( 'Not set' );
      else
        echo $meeting_time[0];
      break;

    // Connect Group Type
    case 'type-of-group' :
      $type = get_the_terms( $post_id, 'connect-group-type' );
      if ( empty( $type ) )
        echo __( 'Not set' );
      else
        echo $type[0]->name;
      break;

    // Connect Group Leaders
    case 'leaders' :
      $leaderIds = get_post_meta( $post_id, 'leader', true );

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
add_action( 'manage_connect-group_posts_custom_column', 'set_column_content__connect_group', 10, 2 );
