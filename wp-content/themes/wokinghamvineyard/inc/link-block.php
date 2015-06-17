      <section class="section section--light section--link-block">
        <div class="centering">
          <div class="link-block">
            <div class="grid grid--centered"><?php
              foreach ($row['links'] as $link) {

                $linkUrl;

                switch ($link['what_type_of_link']) {
                  case 'page':
                    $linkUrl = $link['internal_link'];
                    break;

                  case 'anchor':
                    $linkUrl = '#' . $link['page_anchor'];
                    break;

                  case 'external':
                    $linkUrl = $link['external_link'];
                    break;
                }

              ?><div class="grid__item tablet-one-third"><a href="<?php echo $linkUrl; ?>" <?php echo ($link['what_type_of_link'] == 'external') ? 'target="new"' : null; ?> class="link-block__link <?php echo ($link['what_type_of_link'] == 'anchor') ? 'link-block__link--down js-scroll-link' : null; ?>"><?php echo $link['link_text']; ?></a></div><?php

            } ?></div>
          </div>
        </div>
      </section>
