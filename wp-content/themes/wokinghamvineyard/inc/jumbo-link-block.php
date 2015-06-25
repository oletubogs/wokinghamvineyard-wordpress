      <section class="section section--light">
        <div class="centering">
          <div class="media-blocks--links">
            <div class="grid grid--centered"><?php

            foreach ($row['links'] as $link) {

              $linkUrl;

              switch ($link['what_type_of_link']) {
                case 'page':
                  $linkUrl = get_permalink( $link['internal_link'] );
                  break;

                case 'external':
                  $linkUrl = $link['external_link'];
                  break;
              }

              ?><div class="grid__item tablet-one-half desktop-one-third"><a href="<?php echo $linkUrl; ?>" <?php echo ($link['what_type_of_link'] == 'external') ? 'target="new"' : null; ?> class="media-block"><img src="<?php

                  echo $link['link_image']['sizes']['ministry-grid'];

                ?>" class="media-block__image hidden--mobile"><div class="media-block__title"><?php echo $link['link_text']; ?></div></a></div><?php
              } ?>
            </div>
          </div>
        </div>
      </section>
