<?php
/**
 * Template Name: Search Page
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */

get_header();

$queryString = sanitize_text_field($_REQUEST['query']);

$customFields = array(
  'title',
  'subtitle',
  'description',
  'page_content_%_content_block_%_content_block__text',
  'page_content_%_content_block_%_content_block__title',
);
$customFieldsMetaQuery = array(
  'relation' => 'OR'
);

foreach ($customFields as $field) {
  $customFieldsMetaQuery[] = array(
    'key'      => $field,
    'value'    => $queryString,
    'compare'  => 'LIKE',
  );
}

$q1 = new WP_Query(array(
  'post_type'      => array('page', 'connect-group'),
  's' => $queryString,
  'post_status'    => 'publish',
  'posts_per_page' => -1,
));

$q2 = new WP_Query(array(
  'post_type'      => array('page'),
  'meta_query'     => $customFieldsMetaQuery,
  'post_status'    => 'publish',
  'posts_per_page' => -1,
));

$searchQuery = new WP_Query();
$mergedPostResults = array_merge( $q1->posts, $q2->posts );
$uniqueMergedPostResults = array_unique( $mergedPostResults, SORT_REGULAR );

function sortResultsByPostType($a, $b) {
  return strcmp($a->post_type, $b->post_type);
}
usort($uniqueMergedPostResults, "sortResultsByPostType");
$uniqueMergedPostResults = array_reverse($uniqueMergedPostResults);

$searchQuery->posts = $uniqueMergedPostResults;
$searchQuery->post_count = count( $uniqueMergedPostResults ) + 1;

?>

<main role="main" class="main-content">
  <div class="centering">
    <h1 class="h1">Showing results for: <em><?php echo $queryString; ?></em></h1>
    <section class="search-results">
      <div class="grid"><?php
      if ( $searchQuery -> have_posts() ) { ?>


        <?php
        while ( $searchQuery->have_posts() ) {
          $searchQuery->the_post();
          if (!empty($post)) {
            ?><div class="grid__item tablet-one-half desktop-one-third"><?php get_template_part( 'content', 'search' ); ?></div><?php
          }
        }

       ?></div><?php

      } else {
        ?>No results<?php
      }

    ?>
    </section>
  </div>
</main>

<?php get_footer(); ?>
