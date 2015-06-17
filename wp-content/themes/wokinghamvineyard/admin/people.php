<?php
/**
 * Wokingham Vineyard Admin Customisation
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */




/**
 * Set up custom columns (People)
 * @since Wokingham Vineyard 1.0
 *
 */
function set_columns__people( $columns ) {
  return array(
    'cb' => '<input type="checkbox" />',
    'person-thumbnail' => __( 'Photo' ),
    'title' => __( 'Name' ),
    'family_name' => __( 'Family Name' ),
    'teams' => __( 'Teams' ),
    'team_position' => __( 'Position' )
  );
}
add_filter( 'manage_people_posts_columns' , 'set_columns__people' );
add_action('admin_head', 'set_columns__people__css');

function set_columns__people__css() {
    echo '<style type="text/css">';
    echo '.column-person-thumbnail { width: 75px; padding:0 10px !important; font-size:0 !important; }';
    echo '</style>';
}



/**
 * Register sortable columns (People)
 * @since Wokingham Vineyard 1.0
 *
 */
function set_sortable_columns__people() {
  return array(
    'title' => 'title',
    'family_name' => 'family_name',
    'team_position' => 'team_position',
  );
}
add_filter( 'manage_edit-people_sortable_columns', 'set_sortable_columns__people' );




/**
 * Filter sortable columns (People)
 * @since Wokingham Vineyard 1.0
 *
 */
function set_sortable_orderby__people( $vars ) {

  switch ( $vars['orderby'] ) {
    // Family Name
    case 'family_name' :
      $vars = array_merge( $vars, array(
        'meta_key' => 'family_name',
        'orderby' => 'meta_value'
      ) );
      break;

    // Team Position
    case 'team_position' :
      $vars = array_merge( $vars, array(
        'meta_key' => 'team_position',
        'orderby' => 'meta_value'
      ) );
      break;

    default :
      break;
  }
  return $vars;
}
add_filter( 'request', 'set_sortable_orderby__people' );





/**
 * Add content to custom columns (People)
 * @since Wokingham Vineyard 1.0
 *
 */
function set_column_content__people( $column, $post_id ) {
  global $post;

  switch( $column ) {


    // Person's photo
    case 'person-thumbnail' :
      $teamThumbnail = wp_get_attachment_image_src( get_post_thumbnail_id( $post_id ), 'thumbnail' );
      $thumbnailUrl = ( !empty( $teamThumbnail[0] ) ) ? $teamThumbnail[0] : '/wordpress/wp-content/themes/wokinghamvineyard/static/images/content/team/team-member-placeholder-square.jpg';
      echo '<img src="' . $thumbnailUrl . '" style="max-width:100%;height:auto;">';
      break;


    // Person's family Name
    case 'family_name' :
      $familyName = get_post_meta( $post_id, 'family_name', true );
      if ( empty( $familyName ) )
        echo __( 'Not set' );
      else
        echo $familyName;
      break;

    // Person's team position
    case 'team_position' :
      $teamPosition = get_post_meta( $post_id, 'team_position', true );
      if ( empty( $teamPosition ) )
        echo __( 'Not set' );
      else
        echo $teamPosition;
      break;


    // Person's Teams
    case 'teams' :
      $teamIds = get_post_meta( $post_id, 'team_association', true );

      if (empty($teamIds)) {
        echo __( 'Not set' );
        break;
      }

      // Loop through teams
      foreach ($teamIds as $teamId) {
        $teamName = get_the_title( $teamId );
        $teamNames .= ', <a target="new" href="post.php?post=' . $teamId . '&action=edit">' . $teamName . "</a>";
      }

      if ( empty( $teamNames ) )
        echo __( 'Not set' );
      else
        echo substr($teamNames, 2);
      break;

    default :
      break;
  }
}
add_action( 'manage_people_posts_custom_column', 'set_column_content__people', 10, 2 );
