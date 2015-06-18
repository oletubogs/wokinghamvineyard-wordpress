<?php
/**
 * Template Name: Jumbo
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */

get_header();
$permalink = get_the_permalink();
?>

<main role="main" class="main-content">

  <?php




  // Jumbo
  $title = get_field( 'title' );
  if ( !get_field( 'hide_jumbo' ) ) { ?>
    <section class="jumbo jumbo--no-bottom jumbo--<?php echo basename( get_permalink() );?>" <?php
      $jumboBg = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'full' );
      $jumboBgUrl = $jumboBg[0];
      echo ( !empty( $jumboBgUrl ) ) ? 'style="background-image:url(' . $jumboBgUrl . ')"' : null;
      ?>>
      <div class="centering">
        <h1><?php echo $title; ?></h1>
        <?php
        $subtitle = get_field( 'subtitle' );
        if ( !empty( $subtitle ) ) { ?>
          <p><?php echo $subtitle; ?></p>
        <?php } ?>
      </div>
    </section>

  <?php
  } else {

    if ( !empty($title) ) { ?>
      <div class="centering"><h1 class="h1"><?php echo $title; ?></h1></div>
    <?php }

  }
  // Main content
  $pageContent = get_field( 'page_content' );
  foreach ($pageContent as $row) {

    // Content Row
    if ( $row['acf_fc_layout'] == 'content_row' ) { ?>
      <section class="section section--<?php echo $row['background_colour']; ?>">
        <div class="centering">

          <?php
          $contentBlockCount = count($row['content_block']);

          if ( $contentBlockCount > 1) { ?><div class="grid"><?php }

          // Content Block
          foreach ($row['content_block'] as $block) {

            if ( $contentBlockCount > 1) {
              ?><div class="grid__item tablet-<?php echo $block['tablet-width'];?> <?php echo ( !empty($block['desktop-width']) && $block['desktop-width'] != 'inherit' ) ? 'desktop-' . $block['desktop-width'] : null; ?>"><?php
            } ?>

            <?php if ( !empty($block['image']) ) { ?><img src="<?php echo $block['image']; ?>" class="hidden--mobile"><?php } ?>

            <div <?php echo ( !empty($block['block_anchor']) ) ? 'id="' . $block['block_anchor'] . '"' : null; ?> class="content-block content-block--<?php echo $block['background_colour']; ?> <?php echo ( !empty($block['center_text']) ) ? 'content-block--centered' : null; ?> <?php echo ( !empty($row['font_size']) ) ? 'content-block--'.$row['font_size'] : null; ?>">

              <?php // Title
              if ( !empty($block['content_block__title']) ) { ?>
                <h2 class="h2 content-block__title"><?php echo $block['content_block__title']; ?></h2>
              <?php }


              // Textarea
              if ( !empty($block['content_block__text']) ) { ?>
                <p>
                  <?php
                  // Opening Quote
                  if ( !empty($block['is_quote']) ) { ?>
                    <span class="content-block__quotemark content-block__quotemark--open"></span>
                  <?php }

                  // Text
                  echo $block['content_block__text'];

                  // Closing Quote
                  if ( !empty($block['is_quote']) ) { ?>
                    <span class="content-block__quotemark content-block__quotemark--close"></span>
                  <?php } ?>
                </p>
              <?php }




              // Button
              if (!empty( $block['show_button'] ) && !empty( $block['button_link'] ) && !empty( $block['button_text'] ) ) {
                $btnColourClass = ( in_array( $block['background_colour'], array('dark', 'grey', 'light') ) ) ? 'btn--primary' : 'btn--secondary';
              ?>
                <p><a class="btn <?php echo $btnColourClass; ?>" href="<?php echo $block['button_link']; ?>"><?php echo $block['button_text']; ?></a></p>
              <?php }





              // Teams
              if ( !empty($block['dynamic_content']) && $block['dynamic_content'] == 'teams' && $block['dynamic_content'] !== 'none' ) {
                $args = array (
                  'post_type'       => 'teams',
                  'orderby'         => 'title',
                  'order'           => 'ASC',
                  'posts_per_page'  => -1,
                );
                $team_query = new WP_Query( $args );

                if ( $team_query->have_posts() ) { ?>

                  <?php if ( !empty($block['dynamic_content__title']) && empty( $title ) ) { ?>
                    <h1 class="h1"><?php echo $block['dynamic_content__title']; ?></h1>
                  <?php } else if ( !empty($block['dynamic_content__title']) ) { ?>
                    <h2 class="h2"><?php echo $block['dynamic_content__title'];?></h2>
                  <?php } ?>

                  <div class="content-block content-block--no-padding">
                  <div class="grid grid--gutterless"><?php

                  $i = 0;
                  while( $team_query->have_posts()) {
                  $team_query->the_post();
                  ?><div class="grid__item mobile-one-half tablet-one-third">
                    <article class="team-member">
                      <div class="team-member__photo">
                        <?php
                        $thumbnail = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'landscape' );
                        $thumbnailUrl = $thumbnail[0];
                        if (empty($thumbnailUrl) ) {
                          $thumbnailUrl = '/wordpress/wp-content/themes/wokinghamvineyard/static/images/content/team/team-member-placeholder.jpg';
                        }
                        ?>
                        <img src="<?php echo $thumbnailUrl; ?>">
                      </div>
                      <div class="team-member__details">
                        <div class="team-member__name"><?php the_title(); ?></div>
                      </div>
                    </a>
                  </div><?php
                  }

                  ?></div></div><?php
                }
              }





              // Connect Groups
              else if ( !empty($block['dynamic_content']) && $block['dynamic_content'] == 'connect-groups' && $block['dynamic_content'] !== 'none' ) {
                $args = array (
                  'post_type'       => 'connect-group',
                  'orderby'         => 'title',
                  'order'           => 'ASC',
                  'posts_per_page'  => -1,
                );
                if ( !empty ( $_GET['title_starting_letter'] ) ) {
                  $args['title_starting_letter'] = sanitize_text_field($_GET['title_starting_letter']);
                }
                $connect_query = new WP_Query( $args );

                if ( $connect_query->have_posts() ) { ?>

                  <?php if ( !empty($block['dynamic_content__title']) && empty( $title ) ) { ?>
                    <h1 class="h1"><?php echo $block['dynamic_content__title']; echo ( !empty ( $args['title_starting_letter'] ) ) ? ': ' . $args['title_starting_letter'] : null; ?></h1>
                  <?php } else if ( !empty($block['dynamic_content__title']) ) { ?>
                    <h2 class="h2"><?php echo $block['dynamic_content__title']; echo ( !empty ( $args['title_starting_letter'] ) ) ? ': ' . $args['title_starting_letter'] : null;?></h2>
                  <?php } ?>

                  <div class="content-block content-block--no-padding">
                  <div class="grid grid--gutterless"><?php

                  $i = 0;
                  while( $connect_query->have_posts()) {
                  $connect_query->the_post();
                  $post_terms = wp_get_post_terms($post->ID, 'connect-group-type');
                  $connect_group_type = $post_terms[0]->name;
                  ?><div class="grid__item mobile-one-half tablet-one-third">
                    <a href="<?php the_permalink(); ?>" class="team-member">
                      <div class="team-member__photo">
                        <?php
                        $thumbnail = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'landscape' );
                        $thumbnailUrl = $thumbnail[0];
                        if (empty($thumbnailUrl) ) {
                          $thumbnailUrl = '/wordpress/wp-content/themes/wokinghamvineyard/static/images/content/team/team-member-placeholder.jpg';
                        }
                        ?>
                        <img src="<?php echo $thumbnailUrl; ?>">
                      </div>
                      <div class="team-member__details">
                        <div class="team-member__name"><?php the_title(); ?></div>
                        <?php

                        $weekday = get_field( 'meeting_day' );
                        $weekdays = array('Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays');

                        $when = $connect_group_type;
                        $when .= ' / ';
                        $when .= get_field( 'occurence' );
                        $when .= ' / ';
                        $when .= $weekdays[$weekday - 1] . ' @ ' . get_field( 'meeting_time' );

                        ?>
                        <div class="team-member__position"><?php echo $when; ?></div>
                      </div>
                    </a>
                  </div><?php
                  }

                  ?></div></div><?php
                }
              }





              // Photos
              else if ( !empty($block['dynamic_content']) && $block['dynamic_content'] == 'photos' && $block['dynamic_content'] !== 'none' ) {

                if (!empty( $block['photos'] )) {

                  $tabletGridWidth = ( $block[ 'tablet-width' ] == 'one-whole' ) ? 'tablet-one-third' : null;
                  $i = 1;

                  ?><div class="grid"><?php
                    foreach ($block['photos'] as $photo) {
                      $photoUrl = $photo['photo']['sizes']['landscape'];
                      ?><div class="grid__item mobile-one-half <?php echo $tabletGridWidth; ?>"><img <?=(empty( $tabletGridWidth ) && $i > 2 || $tabletGridWidth == 'tablet-one-third' && $i > 3) ? 'class="gallery__image--not-row-one"' : ''; ?> src="<?php echo $photoUrl; ?>"></div><?php
                      $i++;
                     }
                   ?></div><?php
                 }

              }




              // Team Headshots
              else if ( !empty($block['dynamic_content']) && !empty($block['team_headshots']) && $block['dynamic_content'] !== 'none' ) {
                $teamMembers = get_field( 'team_members', $block['team_headshots'] );
                $mergeTeamsByPhoto = false;

                if ( strtolower(get_the_title($block['team_headshots'])) == 'pastoral' ) {
                  $mergeTeamsByPhoto = true;
                  $teamMembers = mergeTeamMembersByPhoto($teamMembers);
                }

                if ( !empty($block['dynamic_content__title']) ) { ?>
                  <h2 class="h2"><?php echo $block['dynamic_content__title']; ?></h2>
                <?php } ?>

                <div class="team">

                  <div class="grid grid--gutterless"><?php

                    foreach ( $teamMembers as $member ) {
                      $post = $member['person'];

                      $headshotSize = $block['team_headshot_size'];
                      $teamMemberSmallClass = ($headshotSize == 'square' ) ? 'team-member--square' : null;

                      $teamMemberGridWidths = array('one-half' );

                      if ( $headshotSize == 'square' ) {
                        $teamMemberGridWidths[] = 'mobile-one-third';
                      }

                      if ( $block['tablet-width'] == 'one-whole' ) {
                        $teamMemberGridWidths[] = 'tablet-one-quarter';
                      }

                      if ( $block['desktop-width'] == 'auto' ) {
                        $teamMemberGridWidths[] = 'desktop-auto';
                      }
                      else if ( $block['desktop-width'] == 'one-whole' && $headshotSize == 'square' ) {
                        $teamMemberGridWidths[] = 'desktop-one-fifth';
                      }
                      else {
                        $teamMemberGridWidths[] = 'tablet-one-half';
                      }

                      ?><div class="grid__item <?php echo implode(' ', $teamMemberGridWidths); ?>">
                        <article class="team-member <?php echo $teamMemberSmallClass; ?>">
                          <div class="team-member__photo">
                            <?php

                            $thumbnailSize = ($headshotSize == 'square' ) ? array(400, 400) : 'landscape';

                            if (!empty( $member['person']->merged_photo )) {
                              $teamThumbnailUrl = $member['person']->merged_photo;
                            } else {
                              $teamThumbnail = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), $thumbnailSize );
                              $teamThumbnailUrl = $teamThumbnail[0];
                            }
                            if (empty($teamThumbnailUrl) ) {
                              $teamThumbnailUrl = ($headshotSize == 'square' ) ? '/wordpress/wp-content/themes/wokinghamvineyard/static/images/content/team/team-member-placeholder-square.jpg' : '/wordpress/wp-content/themes/wokinghamvineyard/static/images/content/team/team-member-placeholder.jpg';
                            }
                            ?>
                            <img src="<?php echo $teamThumbnailUrl; ?>">
                          </div>
                          <div class="team-member__details">
                            <div class="team-member__name"><?php
                              echo (!empty( $member['person']->merged_name )) ? $member['person']->merged_name : get_field( 'first_name' ).' '.get_field( 'family_name' ); ?></div>
                            <div class="team-member__position"><?php echo (!empty( $member['person']->role )) ? $member['person']->role : $member['role']; ?></div>
                          </div>
                        </article>
                      </div><?php }
                  ?></div></div><?php

                wp_reset_postdata();
              } ?>
            </div>

            <?php if ( $contentBlockCount > 1) {
              ?></div><?php
            }
          }

          if ( $contentBlockCount > 1) {
            ?></div><?php
          } ?>

        </div>
      </section>
    <?php



    // Map
    } else if ( $row['acf_fc_layout'] == 'church_map' ) { ?>
      <section class="map map--wide"><div class="map__container"><div class="map__element js-church-map"></div></div><div class="centering"><div class="content-block content-block--centered js-map-info-container"><h2 class="h2 content-block__title">Where do we meet?</h2><div class="map__information js-map-info"><h3 class="content-block__subtitle"><?php echo $row['meeting_time']; ?></h3><p>Edgbarrow School,<br>Grant Road, Crowthorne<br>Berkshire. RG45 7HZ</p></div><div class="content-block__buttons"><form class="map__directions js-map-directions"><p>Enter your postcode or address below:</p><div class="map__directions__field"><input type="text" placeholder="Enter address" class="control control--text map__directions__address js-map-address"><button type="submit" class="map__directions__button btn btn--clear"><i class="icon icon--search"></i></button><button type="reset" class="btn btn--primary btn--small map__directions__close js-button-close-directions"><i class="icon icon--arrow-left2"></i><span>Back</span></button></div></form><button class="btn btn--primary js-button-show-directions">Get directions</button></div></div></div></section>
    <?php



    // Link Block
    } else if ( $row['acf_fc_layout'] == 'link_block' ) { ?>
      <?php include 'inc/link-block.php'; ?>
    <?php



    // Sunday Teams
    } else if ( $row['acf_fc_layout'] == 'sunday_teams' ) { ?>
      <section class="section section--grey">
        <div class="centering">
          <div class="content-block content-block--grey" id="sunday-teams">
            <h2 class="h2 content-block__title">Our Sunday Teams</h2>
            <div class="grid grid--gutterless"><?php

            $args = array (
              'post_type'  => 'teams',
              'meta_key'      => 'featured_team',
              'meta_value'    => '1',
              'meta_compare'  => '==',
            );
            $team_query = new WP_Query( $args );

            while ( $team_query->have_posts() ) {
              $team_query->the_post();

              $teamLeader = get_field( 'team_leader' );
              $teamLeaderId = $teamLeader[0]->ID;
              $teamLeaderName = get_field( 'first_name', $teamLeaderId) . ' ' . get_field( 'family_name', $teamLeaderId);

              ?><div class="grid__item mobile-one-half tablet-one-third">
                <article class="team-member">
                  <div class="team-member__photo">
                    <?php
                    $teamThumbnail = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'landscape' );
                    $teamThumbnailUrl = $teamThumbnail[0];
                    if (empty($teamThumbnailUrl) ) {
                      $teamThumbnailUrl = '/wordpress/wp-content/themes/wokinghamvineyard/static/images/content/team/team-member-placeholder.jpg';
                    }
                    ?>
                    <img src="<?php echo $teamThumbnailUrl; ?>">
                  </div>
                  <div class="team-member__details">
                    <div class="team-member__name"><?php echo get_the_title(); ?></div>
                    <div class="team-member__position">Team leader: <?php echo $teamLeaderName; ?></div>
                  </div>
                </article>
              </div><?php
            }
            wp_reset_postdata();
          ?></div>
          </div>
        </div>
      </section>
    <?php



    // Pastoral Welcome
    } else if ( $row['acf_fc_layout'] == 'pastoral_welcome' ) { ?>
      <section class="section--light section--welcome">
        <div class="centering">
          <div class="team-welcome"><div class="grid grid--gutterless"><div class="grid__item tablet-one-half"><div class="team-welcome__photo">Photo of Nino and Debbie Moscardini</div></div><div class="grid__item tablet-one-half"><div class="team-welcome__message"><p>Welcome to Wokingham Vineyard!</p><p>We are people who are getting to know Jesus better and aim to bring love, compassion, forgiveness and acceptance to our church and community.</p><div class="team-welcome__signature">Nino &amp; Debbie Moscardini</div><div class="team-member__position">Senior Pastors</div></div></div></div></div>
        </div>
      </section>

    <?php
    }
  }
  ?>

  <?php wp_reset_postdata(); ?>
</main>

<?php get_footer(); ?>
