<?php
/**
 * The template for displaying connect groups
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */

get_header();
the_post();
?>

<main role="main" class="main-content connect-group">

  <div class="centering">

    <section class="section section--light">
      <?php the_title( '<h1 class="h1">', '</h1>' ); ?>

      <div class="grid"><div class="grid__item tablet-one-half desktop-two-fifths">
        <a href="/wordpress/get-connected/connect-groups/" class="btn btn--primary btn--small btn--block">&larr; View all Groups</a>
        <?php
        $thumbnail = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'landscape' );
        $thumbnailUrl = $thumbnail[0];
        if (empty($thumbnailUrl) ) {
          $thumbnailUrl = '/wordpress/wp-content/themes/wokinghamvineyard/static/images/content/team/team-member-placeholder.jpg';
        }
        ?>
        <img src="<?php echo $thumbnailUrl; ?>">
        <?php
        $weekday = get_field( 'meeting_day' );
        $weekdays = array('Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays');
        ?>
        <ul class="connect-group__info">

          <?php
            $post_terms = wp_get_post_terms($post->ID, 'connect-group-type');
            $connect_group_type = $post_terms[0]->name;
          ?>
          <li class="connect-group__info__item" title="Type: <?php echo $connect_group_type; ?>">
            <i class="icon icon--<?php switch ($connect_group_type) {
              case 'Interest Group':
                echo 'happy';
                break;
              case 'Discipleship Group':
                echo 'book';
                break;
              case 'Going Deeper':
                echo 'droplet';
                break;
            } ?>"></i>
            <span><?php echo $connect_group_type; ?></span>
          </li>


          <li class="connect-group__info__item" title="Occurence: <?php echo get_field( 'occurence' ); ?>">
            <i class="icon icon--spinner11"></i>
            <span><?php echo get_field( 'occurence' ); ?></span>
          </li>

          <?php
            $meeting_time = get_field( 'meeting_time' );
            $meeting_time_split = split(':', $meeting_time);
            $daytime = ($meeting_time_split[0] > 11) ? 'pm' : 'am';
          ?>
          <li class="connect-group__info__item" title="Meeting: <?php echo $weekdays[$weekday - 1] . ' @ ' . $meeting_time . $daytime; ?>">
            <i class="icon icon--calendar"></i>
            <span><?php echo $weekdays[$weekday - 1] . ' @ ' . $meeting_time . $daytime; ?></span>
          </li>

          <?php
          $leaderIds = get_post_meta( $post->ID, 'leader', true );
          $leaders = getLeadersListFromIds($leaderIds, false);
          ?>
          <li class="connect-group__info__item" title="Leaders: <?php echo $leaders; ?>">
            <i class="icon icon--users"></i>
            <span><?php echo $leaders; ?></span>
          </li>

        </ul>
      </div><div class="grid__item tablet-one-half desktop-three-fifths">
        <?php
        $description = get_field( 'description' );
        if ( !empty( $description) ) {
        ?>
          <div class="connect-group__description">
          <?php echo $description; ?>
          </div>
        <?php
        } ?>
      </div></div>
    </section>
  </div>

</main>

<?php get_footer(); ?>
