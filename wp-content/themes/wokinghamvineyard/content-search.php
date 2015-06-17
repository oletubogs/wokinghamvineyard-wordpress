<?php
/**
 * The template part for displaying results in search pages
 *
 * Learn more: {@link https://codex.wordpress.org/Template_Hierarchy}
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */
?>
<a href="<?php echo get_permalink(); ?>" class="search-result">
  <div class="search-result__type"><?php
    switch (get_post_type()) {
      case 'connect-group':
        echo 'Connect Group';
        break;

      default:
        echo 'Page';
        break;
    }
  ?></div>
  <div class="search-result__page"><?php
  get_field('title');
  echo get_the_title();
  ?></div>
  <?php

  // Jumbo
  $contentBlockString;
  if( get_field('page_content') ) {
    while( has_sub_field('page_content') ) {
      $content_blocks = get_sub_field('content_block');
      if (!empty( $content_blocks )) {
        foreach ($content_blocks as $content_block) {
          $contentBlockString .= $content_block['content_block__text'];
        }
      }
    }

    $contentBlockStringExcerpt = substr($contentBlockString, 0, 100);
    if (strlen($contentBlockString) > $contentBlockStringExcerpt) {
      $contentBlockStringExcerpt .= '...';
    }
    echo '<p>' . $contentBlockStringExcerpt . '</p>';
  }


  // Connect Group
  $connectGroupDescription = get_field('description');
  if (!empty($connectGroupDescription)) { echo '<p>' . $connectGroupDescription . '</p>'; }

  ?>
</a>
