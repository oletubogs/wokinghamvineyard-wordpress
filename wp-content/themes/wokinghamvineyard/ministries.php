<?php
/**
 * Template Name: Choose Ministry
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */

get_header();
?>

<main role="main" class="main-content">

  <?php
  $pageContent = get_field('page_content');
  foreach( $pageContent as $row ) {

    if ($row['acf_fc_layout'] == 'choose_ministries') { ?>
      <section class="section section--light">
        <div class="centering">
          <div class="media-blocks--links">
            <div class="grid grid--centered"><?php

            foreach( $row['ministries'] as $ministry ) {

              $ministryTitle = get_field('title', $ministry['ministry']);

              ?><div class="grid__item tablet-one-half desktop-one-third"><a href="<?php echo get_permalink($ministry['ministry']); ?>" class="media-block"><img src="<?php

                $ministryImage = wp_get_attachment_image_src( get_post_thumbnail_id( $ministry['ministry'] ), 'ministry-grid' );

                $ministryImageUrl = $ministryImage[0];

                if (empty($ministryImageUrl)) {
                  $ministryImageUrl = get_template_directory_uri() . '/static/images/content/ministries-grid/youth.jpg';
                }

                echo $ministryImageUrl;

                ?>" class="media-block__image hidden--mobile"><div class="media-block__title"><?php echo $ministryTitle; ?></div></a></div><?php
              } ?>
            </div>
          </div>
        </div>
      </section>

    <?php } else if ($row['acf_fc_layout'] == 'link_block') { ?>
      <?php include 'inc/link-block.php'; ?>
    <?php } ?>
  <?php } ?>

</main>

<?php get_footer(); ?>
